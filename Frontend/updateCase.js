document.addEventListener("DOMContentLoaded", () => {
    const closeButton = document.querySelector("#successPopUp .close_btn");
    if (closeButton) {
        closeButton.addEventListener("click", closeSuccessPopUp);
    }

    const statusFoundButton = document.getElementById('status_found_button');
    const statusInput = document.getElementById('status');

    if (statusFoundButton && statusInput) {
        let isFound = statusInput.value === 'found';

        const updateButtonStyle = () => {
            if (isFound) {
                statusFoundButton.classList.add('active');
            } else {
                statusFoundButton.classList.remove('active');
            }
        }

        //default awal
        updateButtonStyle();

        //event listener
        statusFoundButton.addEventListener('click', () => {
            isFound = !isFound;
            statusInput.value = isFound ? 'found' : 'lost';
            updateButtonStyle();
        })
    }
})


document.getElementById('update_form').addEventListener('submit', async function (e) {
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

    const namaHewanInput = document.getElementById('namaHewan');
    const namaDanSpeciesType = namaHewanInput.value.trim(); 

    let name = '';
    let speciesType = '';
    if (namaDanSpeciesType) {
        const parts = namaDanSpeciesType.split('-');
        if (parts.length >= 2) {
            name = parts[0].trim();
            speciesType = parts.slice(1).join('-').trim();
        } else {
            alert("Format Nama Hewan-Spesies tidak sesuai");
            return;
        }
    }
    const formData = new FormData(form);
    formData.set('name', name);
    formData.set('speciesType', speciesType);

    console.log("Contents of FormData being sent:");
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File (${value.name}, ${value.size} bytes)`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }




    const endpoint = `/api/cases/${reportID}`;
    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 400 && data.errors) {
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
                alert('Gagal Update case: ' + (data.message || 'Unknown error.'));
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
});

const showSuccessPopUp = () => {
    const popUp = document.getElementById("successPopUp");
    popUp.classList.remove("hidden");
}

const closeSuccessPopUp = () => {
    const popUp = document.getElementById("successPopUp");
    popUp.classList.add("hidden");
}


