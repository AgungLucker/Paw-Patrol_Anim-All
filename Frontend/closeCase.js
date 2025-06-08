document.addEventListener("DOMContentLoaded", () => {
    const closeButton = document.querySelector("#successPopUp .close_btn");
    if (closeButton) {
        closeButton.addEventListener("click", closeSuccessPopUp);
    }

    const confirmationButton = document.getElementById('confirmation_btn');
    const submitButton = document.querySelector('#close_form .submit_btn');

    // submitButton enabled kalau confirmationButton dipencet
    if (confirmationButton && submitButton) {
        let isConfirmed = false;

        const updateSubmitButtonStatus = () => {
            if (isConfirmed) {
                submitButton.disabled = false;
                confirmationButton.classList.add('active');
            } else {
                submitButton.disabled = true;
                confirmationButton.classList.remove('active');
            }
        }

        //default awal
        updateSubmitButtonStatus();

        //event listener
        confirmationButton.addEventListener('click', () => {
            isConfirmed = !isConfirmed;
            updateSubmitButtonStatus();
        })
    }
})


document.getElementById('close_form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const strReportID = document.getElementById('IDCase');
    let reportID;

    if (strReportID) {
        reportID = parseInt(strReportID.value, 10);
        if (isNaN(reportID)) {
            console.error("ID Case bukan angka:", strReportID);
            return;
        }
    }

    const formData = new FormData(form);
    formData.append('status', "returned");

    // debugger
    console.log("Contents of FormData being sent:");
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File (${value.name}, ${value.size} bytes)`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }
    try {
        const statusEndPoint = `/api/cases/${reportID}`;
        const statusResponse = await fetch(statusEndPoint);
        const statusData = await statusResponse.json();

        if (!statusResponse.ok) {
            alert(`Gagal memeriksa status case: ${statusData.message || 'Case tidak ditemukan.'}`);
            console.error("Gagal memeriksa status case:", statusData);
            return;
        }

        //cek statusnya found 
        if (statusData.status !== 'found') {
            alert('status case bukan found');
            return;
        }
        const endpoint = `/api/cases/${reportID}`;
        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                body: formData,
            });
        
            const data = await response.json();
        
            if (!response.ok) {
                    if (response.status === 400&& data.errors) {
                        let errorMessage = 'Gagal validasi input:\n';
                        data.errors.forEach(err => {
                            errorMessage += `- ${err.msg}\n`; 
                        });
                        alert(errorMessage);
                        console.error('Validation errors:', data.errors);
                    } else if (response.status === 401) {
                        alert(data.message);
                        console.error('Akses ditolak:', data);
                    } else if (response.status === 404) {
                        alert(data.message);
                        console.error('Terjadi kesalahan:', data);
                    } else {
                        alert('Gagal Close case: ' + (data.message || 'Unknown error.'));
                        console.error('Error:', data.errors);
                    }
            } else {
                console.log("Response data:", data);
                showSuccessPopUp();
                form.reset();
            }
        } catch (err) {
            alert("Terjadi error:", err);
            console.error("Terjadi error:", err);

        }
    } catch (err) {
        consoler.error("Terjadi error", err);
    }
});

const showSuccessPopUp = () => {
    const popUp = document.getElementById("successPopUp");
    popUp.classList.remove("hidden");
}

const closeSuccessPopUp = () => {
    const popUp = document.getElementById("successPopUp");
    popUp.classList.add("hidden");
}


