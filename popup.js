document.addEventListener("DOMContentLoaded", () => {
    const userName = document.getElementById('userName');
    const githubLink = document.getElementById('githubLink');
    const saveBtn = document.getElementById('saveBtn');

    // 기존 저장된 정보 불러오기
    chrome.storage.sync.get(['userName', 'githubLink'], (data) => {
        userName.value = data.userName || '';
        githubLink.value = data.githubLink || '';
    });

    // 저장버튼 클릭 이벤트
    saveBtn.addEventListener('click', () => {
        chrome.storage.sync.set({
            userName: userName.value,
            githubLink: githubLink.value
        }, () => {
            alert('정보가 저장되었습니다.');
        });
    });
});
