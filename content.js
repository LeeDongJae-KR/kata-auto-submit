let problemMap = {};

fetch(chrome.runtime.getURL("data/problem_title_mapping.json"))
    .then(res => res.json())
    .then(json => {
        problemMap = json;
        console.log("✅ 문제번호 맵 로딩 완료");
    })
    .catch(err => {
        console.error("❌ 문제번호 맵 로딩 실패:", err);
    });

    function extractCodeFromDOM() {
        const lineNodes = document.querySelectorAll('.CodeMirror-line');
        let code = '';
        lineNodes.forEach(line => {
            code += line.innerText + '\n';
        });
        return code.trim();
    }
    
function submitToGoogleForm() {

    console.log("🚀 submitToGoogleForm 실행됨");

    const rawTitle = document.querySelector('ol.breadcrumb li.active')?.innerText.trim();
    const mappedTitle = problemMap[rawTitle];


    // ✅ 1. 맵핑 데이터 로딩 여부 확인
    if (Object.keys(problemMap).length === 0) {
        alert("❗ 문제 번호 맵핑이 아직 로딩되지 않았습니다.");
        return;
    }

    // ✅ 2. 문제 제목 추출
    if (!rawTitle) {
        alert("❌ 문제 제목을 찾을 수 없습니다.");
        return;
    }

    if (!mappedTitle) {
        alert(`🛑 매핑된 문제 제목을 찾을 수 없습니다: "${rawTitle}"`);
        return;
    }


    const rawCode = extractCodeFromDOM();
    if (!rawCode || rawCode.trim() === '') {
        alert("❌ 코드가 비어 있습니다.");
        return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();


    chrome.storage.sync.get(['userName', 'githubLink'], (data) => {
        if (!data.userName) {
            alert('이름을 먼저 설정해주세요!');
            return;
        }

        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfQx04xqawsR_bhF_9ETixresMShqstSaznr5bCwBoVMo2GTw/formResponse';

        const formData = new URLSearchParams();
        formData.append('entry.770271090', data.userName);          // 이름
        formData.append('entry.1615397682', mappedTitle);          // 문제 제목
        formData.append('entry.420774658', rawCode);                // 코드
        formData.append('entry.649430918', data.githubLink || '');  // GitHub 링크
        formData.append('entry.1567117501_year', String(year));
        formData.append('entry.1567117501_month', String(month));
        formData.append('entry.1567117501_day', String(day));

        fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        })
            .then(() => {
                console.log('✅ 구글 폼 제출 완료!');
            })
            .catch(err => {
                console.error('❌ 폼 제출 오류:', err);
            });
    });
}

function observeSubmitButton() {
    const submitButton = document.querySelector('#submit-code');  // ✅ 셀렉터 수정
    if (submitButton && !submitButton.dataset.autoSubmitAttached) {
        submitButton.addEventListener('click', () => {
            console.log("🖱️ 제출 버튼 클릭됨");
            setTimeout(submitToGoogleForm, 2000); // 채점 딜레이 고려
        });
        submitButton.dataset.autoSubmitAttached = "true";
        console.log("✅ 제출 버튼 이벤트 리스너 등록됨");
    }
}

setInterval(observeSubmitButton, 500); // ⏱️ 0.5초마다 체크


