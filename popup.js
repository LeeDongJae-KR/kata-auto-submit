document.addEventListener("DOMContentLoaded", async () => {
    const userNameInput = document.getElementById('userName');
    const githubLinkInput = document.getElementById('githubLink');
    const saveBtn = document.getElementById('saveBtn');

    const userData = await loadUserData();
    initializeUI(userData);

    // 저장버튼 클릭 이벤트
    saveBtn.addEventListener('click', () => {
        chrome.storage.sync.set({
            userName: userNameInput.value,
            githubLink: githubLinkInput.value
        }, () => {
            alert('정보가 저장되었습니다. 창을 닫았다가 다시 열어보세요!');
        });
    });
});


function loadUserData(){
    // 기존 저장된 정보 불러오기
    return new Promise((resolve)=> {chrome.storage.sync.get(['userName', 'githubLink'], (data) => {
        resolve({
            userName: data.userName || '',
            githubLink: data.githubLink || ''
            });
        });
    });
}

function initializeUI({userName, githubLink}){
    const greeting = document.getElementById("greeting");
    const userNameInput = document.getElementById("userName");
    const githubLinkInput = document.getElementById("githubLink");
    const hasInfo = !!userName;
    greeting.textContent = hasInfo ? `안녕하세요, ${userName}님 👋` : '';
    userNameInput.value = userName;
    githubLinkInput.value = githubLink;

}