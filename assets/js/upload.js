document.addEventListener('DOMContentLoaded', function () {
  
    // 드롭 영역을 가져오고 드롭된 파일을 저장할 배열을 만듬
    let dropArea = document.getElementById("drop-area");
    let droppedFiles = [];
  
    // 삭제 버튼 생성 후 삭제 버튼 클릭시 실행될 함수 선언
    let deleteAllButton = document.createElement('button');
    deleteAllButton.addEventListener('click', function () {
        deleteAllImages();
    });
  
    // 드래그 앤 드롭 이벤트의 기본 동작을 방지하기 위해 이벤트 리스너를 추가
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
  
    // 드롭 이벤트를 처리하는 이벤트 리스너 추가
    dropArea.addEventListener('drop', handleDrop, false);
  
    // 드래그 앤 드롭 이벤트의 기본 동작을 방지하는 함수
    function preventDefaults(e) {
        e.preventDefault(); // 고유 동작을 중지 시키고 
        e.stopPropagation(); // 상위 엘리먼트로 이벤트 전파를 중단 시키기 위한 기본 함수
    }
  
    // 드래그 시 실행시킬 함수
    function handleDrop(e) {
        var dt = e.dataTransfer;
        var files = dt.files;
  
        if (!validateFiles(files)) {
            return;
        }
  
        droppedFiles = []; // 드래그 한 파일을 배열에 담고 
        droppedFiles = droppedFiles.concat([...files]); // 배열을 전개 연산자로 값을 풀기
        initializeProgress(droppedFiles.length);
        processFilesSequentially(droppedFiles);
    }
  
    // 삭제된 파일 배열을 재설정하고 각 파일의 진행 상태를 초기화
    function deleteAllImages() {
        let gallery = document.getElementById('gallery');
        let paragraphs = document.querySelectorAll('.img-contianer');
        let deleteAllButton = document.getElementById('deleteAllButton');
    
        // 갤러리 아래 모든 엘리먼트 삭제
        while (gallery.firstChild) {
            gallery.removeChild(gallery.firstChild);
        }
    
        // 삭제 버튼 누르면 다시 파일 드래그 안내 부분 보이게
        paragraphs.forEach(function (paragraph) {
            paragraph.classList.remove('after');
        });
    
        // 전체 삭제 버튼을 눌렀을때 버튼 안보이게 
        if (deleteAllButton) {
            deleteAllButton.parentNode.removeChild(deleteAllButton);
        }
    
        // 이미지가 하나도 없을 때 버튼 비활성화
        let applicationButtons = document.querySelectorAll('.application-warp button');
        applicationButtons.forEach(function(button) {
            button.disabled = true;
        });
    
        // 파일 입력 요소 상태 재설정 식제후 재업로드 안되는 문제 해결를 위해
        let fileInput = document.getElementById("fileElem");
        fileInput.value = ""; // 파일 입력 필드 초기화
    }
  
    // 파일을 순차적으로 처리하는 기능
    function processFilesSequentially(files) {
        let chain = Promise.resolve();
        files.forEach((file, index) => {
            chain = chain.then(() => {
                return new Promise((resolve) => {
                    uploadFile(file, index);
                    previewFile(file);
                    resolve();
                });
            });
        });
    }
  
    // 파일 업로드버튼 눌렀을때 파일을 순차적으로 처리하는 기능
    let uploadProgress = [];
    function initializeProgress(numFiles) {
        uploadProgress = [];
        for (let i = numFiles; i > 0; i--) {
            uploadProgress.push(0);
        }
    }
  
    // 파일 입력 요소를 가져오고 파일 선택을 처리하기 위한 이벤트 리스너를 추가
    // 사진 촬영 부분 추가
    let fileInput = document.getElementById("fileElem");
    let cameraInput = document.getElementById("cameraInput");
    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });
    cameraInput.addEventListener('change', function () {
        handleFiles(this.files);
    });
    // 선택한 파일을 처리하는 기능
    function handleFiles(files) {
        files = [...files];
  
        if (!validateFiles(files)) {
            return;
        }
  
        // 각 파일의 진행 상황을 초기화하고 업로드/미리보기
        initializeProgress(files.length);
        files.forEach((file, index) => {
            // 새로운 파일 객체 생성 삭제후 똑같은 파일 올릴시 안되는 문제 해결
            let newFile = new File([file], file.name, { type: file.type });
            uploadFile(newFile, index);
            previewFile(newFile);
        });
    }
  
    // 파일 미리 보기 처리 하는 부분
    function previewFile(file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            let imgContainer = document.createElement('div');
            let img = document.createElement('img');
            let fileNameContainer = document.createElement('div');
            let closeButton = document.createElement('span');
            let paragraphs = document.querySelectorAll('.img-contianer');
            let applicationButtons = document.querySelectorAll('.application-warp button');
  
            // 파일 확장자 검사해서 이미지가 아닐시 섬네일을 아래 경로 이미지로 보여지게
            const allowedImageExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
            if (!allowedImageExtensions.exec(file.name)) {
                img.src = '../assets/images/img-icon.svg'; // 
            } else {
                img.src = reader.result;
            }
  
            closeButton.className = 'close-image';
  
            // 파일 마다 삭제 버튼 관련된 이벤트 리스너 
            closeButton.addEventListener('click', function () {
                imgContainer.remove();
                checkShowMessages();
  
                // 이미지가 하나도 없으면 전체 삭제 버튼 안보이게
                if (document.getElementById('gallery').childElementCount === 0) {
                    let deleteAllButton = document.getElementById('deleteAllButton');
                    if (deleteAllButton) {
                        deleteAllButton.remove();
                    }
                }
            });
  
            fileNameContainer.innerText = file.name;
            fileNameContainer.className = 'file-name';
  
            // 이미지 미리 보기에 넣을 엘리먼트
            imgContainer.appendChild(img);
            imgContainer.appendChild(fileNameContainer);
            imgContainer.appendChild(closeButton);
  
            // 갤러리에 이미지 없으면 원래 형태로
            document.getElementById('gallery').appendChild(imgContainer);
            paragraphs.forEach(function (paragraph) {
              paragraph.classList.add('after');
            });
            // 갤러리에 이미지 추가시 신청 버튼 활성화
            applicationButtons.forEach(function(button) {
              button.disabled = false; 
            });
  
            // 전체 삭제 버튼이 없으면 다시 보여지는 부분 선언
            if (!document.getElementById('deleteAllButton')) {
                let deleteAllButton = document.createElement('button');
                deleteAllButton.id = 'deleteAllButton';
                deleteAllButton.innerHTML = '전체 삭제';
                deleteAllButton.addEventListener('click', function () {
                    deleteAllImages();
                });
  
                document.getElementById('drop-area').appendChild(deleteAllButton);
            }
        };
    }
  
    // 갤러리 아이디 부분에 이미지가 있는지 여부에 따라서 메세지 출력하는 함수
    function checkShowMessages() {
        let gallery = document.getElementById('gallery');
        var paragraphs = document.querySelectorAll('.img-contianer');
        let deleteAllButton = document.getElementById('deleteAllButton');
  
        if (gallery.childElementCount === 0) {
            paragraphs.forEach(function (paragraph) {
                paragraph.classList.remove('after');
            });
            
            if (deleteAllButton) {
                deleteAllButton.style.display = 'none';
            }
  
            // 버튼 비활성화
            let applicationButtons = document.querySelectorAll('.application-warp button');
            applicationButtons.forEach(function(button) {
                button.disabled = true;
            });
        } else {
            if (deleteAllButton) {
                deleteAllButton.style.display = 'block';
            }
        }
    }
  
    // 파일 형식 검사를 위한 함수
    function validateFiles(files) {
        const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.pdf|\.tif|\.tiff)$/i;
  
        for (let i = 0; i < files.length; i++) {
            if (!allowedExtensions.exec(files[i].name)) {
                alert('지원하는 파일 형식이 아닙니다.');
                return false;
            }
        }
        return true;
    }
  
    // XMLHttpRequest를 사용하여 Cloudinary 엔드포인트에 파일을 업로드하는 기능  
    function uploadFile(file, i) {
        var url = 'https://api.cloudinary.com/v1_1/urlservice/image/upload?api_key=842582577334323';
        var xhr = new XMLHttpRequest();
        var formData = new FormData();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
        formData.append('upload_preset', 'ujpu6gyk');
        formData.append('file', file);
        formData.append('timestamp', Date.now()); // 고유 타임스탬프 추가
        xhr.send(formData);
    }
  });
  