let problemMap = {};
let problemMapSql = {};

fetch(chrome.runtime.getURL("data/problem_title_mapping.json"))
    .then(res => res.json())
    .then(json => {
        problemMap = json;
        console.log("✅ 알고리즘 문제 맵 로딩 완료");
    })
    .catch(err => {
        console.error("❌ 알고리즘 문제 맵 로딩 실패:", err);
    });
fetch(chrome.runtime.getURL("data/problem_title_mapping_sql.json"))
    .then(res => res.json())
    .then(json => {
        problemMapSql = json;
        console.log("✅ SQL 문제 맵 로딩 완료");
    })
    .catch(err => {
        console.error("❌ SQL 문제 맵 로딩 실패:", err);
    });;

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
    let mappedTitle = null;
    const isSQL = problemMapSql.hasOwnProperty(rawTitle);
    const isAlgorithm = problemMap.hasOwnProperty(rawTitle);


    // ✅ 1. 맵핑 데이터 로딩 여부 확인
    if ((isSQL && Object.keys(problemMapSql).length === 0) ||
        (isAlgorithm && Object.keys(problemMap).length === 0)) {
        alert("❗ 문제 번호 맵핑이 아직 로딩되지 않았습니다.");
        return;
    }

    // ✅ 2. 문제 제목 추출
    if (!rawTitle) {
        alert("❌ 문제 제목을 찾을 수 없습니다.");
        return;
    }

    if (isSQL) {
        mappedTitle = problemMapSql[rawTitle];
    } else if (isAlgorithm) {
        mappedTitle = problemMap[rawTitle];
    } else {
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

        const formUrl = isSQL
        ? 'https://docs.google.com/forms/d/e/1FAIpQLSdF3V4pxLrMTMlA2WKLxwhfoyRnXYDgQtxATUj3eYtSLjrZuQ/formResponse'
        : 'https://docs.google.com/forms/d/e/1FAIpQLSfQx04xqawsR_bhF_9ETixresMShqstSaznr5bCwBoVMo2GTw/formResponse';

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

let hasSubmitted = false; // 중복 제출 방지용

function startAutoSubmit() {
    const modal = document.querySelector("#modal-dialog.show");
    if (!modal || hasSubmitted) return;

    const headerEl = modal.querySelector(".modal-header > h4");
    const checkText = headerEl?.textContent?.trim() || '';

    if (checkText === '정답입니다!') {
        hasSubmitted = true;
        console.log("✅ 정답 확인됨, 자동 제출 시작");
        setTimeout(() => {
            submitToGoogleForm();
        }, 500); // 렌더링 지연 고려한 딜레이
    } else {
        console.log("⛔ 정답이 아니므로 제출하지 않음");
    }
}

// 0.5초 간격으로 모달 상태 감지
setInterval(() => {
    startAutoSubmit();
}, 500);
