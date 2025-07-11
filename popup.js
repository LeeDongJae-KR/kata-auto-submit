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

// 기존에 저장된 사용자 이름, 깃허브 주소 반환
function loadUserData(){
    return new Promise((resolve)=> {chrome.storage.sync.get(['userName', 'githubLink'], (data) => {
        resolve({
            userName: data.userName || '',
            githubLink: data.githubLink || ''
            });
        });
    });
}

// CSV 처리 관련 유틸
const csvToArray = async (url) => {
    const res = await fetch(url);
    const text = await res.text();
    return text.split('\n').map(line => line.split(',').map(cell => cell.trim()));
};

function initializeUI({userName, githubLink}){
    const greeting = document.getElementById("greeting");
    const nextAlgo = document.getElementById("nextAlgo");
    const userNameInput = document.getElementById("userName");
    const githubLinkInput = document.getElementById("githubLink");
    const hasInfo = !!userName;
    greeting.textContent = hasInfo ? `안녕하세요, ${userName}님 👋` : '';
    userNameInput.value = userName;
    githubLinkInput.value = githubLink;

    if(hasInfo){
        fetchLevelAndNextProblems(userName).then(({userLevel, nextAlgoTitle}) => {
            level.textContent = `현재 레벨: ${userLevel ?? '--'}`;
            nextAlgo.textContent = nextAlgoTitle || '--';
        });
    }

}

// status 시트로부터 사용자 레벨 정보 가져오는 함수
function getUserLevel(sheet, userName){
    for (let i = 7; i <sheet.length; i++){ //8열부터 이름 시작
        const name = sheet[i][5]?.trim();
        const level = sheet[i][6]?.trim();
        if (name === userName) return level || null;
    }
    return null;
}

function getNextProblemTitle(sheet, userName, nameColumnIndex = 5, titleRowIndex = 4, startCol = 8) {
    //I5~제목행 | I8~학생status행
    for (let i = 7; i < sheet.length; i++) {
        if (sheet[i][nameColumnIndex]?.trim() === userName) {
            const statusRow = sheet[i];
            const titleRow = sheet[titleRowIndex];
            for (let col = startCol; col < statusRow.length; col++) {
                if (!statusRow[col] || statusRow[col].trim() === "") {
                    return titleRow[col]?.trim() || null;
                }
            }
        }
    }
    return null;
}

// 사용자 레벨 정보를 반환하는 함수
async function fetchLevelAndNextProblems(userName){
    const sqlStatusUrl = 'https://docs.google.com/spreadsheets/d/1LOh45OoXRDlvcIurbzzxAnBRAoojeueHmbuRA2KwoVU/export?format=csv&gid=415190887';
    const algoStatusUrl = 'https://docs.google.com/spreadsheets/d/1LOh45OoXRDlvcIurbzzxAnBRAoojeueHmbuRA2KwoVU/export?format=csv&gid=361152416';

    const [sqlSheet, algoSheet] = await Promise.all([
        csvToArray(sqlStatusUrl),
        csvToArray(algoStatusUrl)
    ]);

    const nextAlgoTitle = getNextProblemTitle(algoSheet, userName);

    const userLevel = getUserLevel(sqlSheet, userName);

    return {userLevel, nextAlgoTitle}


}