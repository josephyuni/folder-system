from flask import Flask, render_template, request, redirect, jsonify
import os
import docx2txt
import PyPDF2

app = Flask(__name__)

# 设置允许上传的文件类型
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}


# 检查文件扩展名是否在允许的扩展名列表中
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# 处理根路径和文件路径的路由
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # 获取选择的路径
        selected_path = request.form['selected_path']
        
        # 获取关键字
        keyword = request.form['keyword']
        
        # 搜索文件内容并返回结果
        search_results = search_files(selected_path, keyword)
        
        # 在前端页面中显示结果
        return render_template('index.html', results=search_results)

    # 渲染初始页面
    return render_template('index.html')


# 获取根目录下的所有盘符
@app.route('/root-drives')
def root_drives():
    drives = get_root_drives()
    return jsonify(drives)


# 获取指定路径下的文件夹列表
@app.route('/subdirectories')
def subdirectories():
    path = request.args.get('path')
    subdirectories = get_subdirectories(path)
    return jsonify(subdirectories)


# 获取指定文件内容的路由
@app.route('/file-content')
def file_content():
    path = request.args.get('path')
    line = int(request.args.get('line'))
    keyword = request.args.get('keyword')
    content = get_file_content(path, line, keyword)
    return content


# 获取根目录下的所有盘符
def get_root_drives():
    drives = []
    for drive in range(ord('A'), ord('Z') + 1):
        drive_letter = chr(drive)
        if os.path.exists(drive_letter + ':\\'):
            drives.append(drive_letter)
    return drives


# 获取指定路径下的文件夹列表
def get_subdirectories(path):
    subdirectories = []
    for entry in os.scandir(path):
        if entry.is_dir():
            subdirectories.append(entry.name)
    return subdirectories


# 递归搜索给定路径下的所有文件并匹配关键字
def search_files(path, keyword):
    results = []
    for root, dirs, files in os.walk(path):
        for file in files:
            if allowed_file(file):
                file_path = os.path.join(root, file)
                if find_keyword_lines(file_path, keyword):
                    result = {
                        'path': file_path,
                        'lines': find_keyword_lines(file_path, keyword)
                    }
                    results.append(result)
    return results


# 在文件中搜索关键字，并返回包含关键字的行号
def find_keyword_lines(file_path, keyword):
    lines = []
    if file_path.endswith('.pdf'):
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for i in range(len(reader.pages)):
                page = reader.pages[i]
                text = page.extract_text()
                if keyword.lower() in text.lower():
                    lines.append(i + 1)
    elif file_path.endswith('.doc') or file_path.endswith('.docx'):
        text = docx2txt.process(file_path)
        text_lines = text.split('\n')
        for i, line in enumerate(text_lines):
            if keyword.lower() in line.lower():
                lines.append(i + 1)
    return lines


# 获取文件内容
def get_file_content(path, line, keyword):
    content = ''
    if path.endswith('.pdf'):
        with open(path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            page = reader.pages[line - 1]
            content = page.extract_text()
    elif path.endswith('.doc') or path.endswith('.docx'):
        text = docx2txt.process(path)
        text_lines = text.split('\n')
        if line - 1 < len(text_lines):
            content = text_lines[line - 1]
    return content


if __name__ == '__main__':
    app.run(debug=True)
