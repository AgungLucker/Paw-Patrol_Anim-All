document.addEventListener("DOMContentLoaded", () => {
    const closeButton = document.querySelector("#successPopUp .close_btn");
    if (closeButton) {
        closeButton.addEventListener("click", closeSuccessPopUp);
    }

})


document.getElementById('add_form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;

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


    const endpoint = `/api/cases`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
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
            } else {
                alert('Terjadi kesalahan: ' + (data.message || 'Unknown error.'));
                console.error('Error:', data.errors);
            }
        } else {
            console.log("Response data:", data);
            const confirmationCode = data.case.confirmationCode; 
            showSuccessPopUp(confirmationCode);
            form.reset();
        }
    } catch (err) {
        alert("Terjadi error:", err);
        console.error("Terjadi error:", err);

    }
});

const showSuccessPopUp = (confirmationCode) => {
    const popUp = document.getElementById("successPopUp");
    const confirmationCodeDisplay = document.getElementById("confirmationCodeDisplay");
    if (popUp && confirmationCodeDisplay) {
        confirmationCodeDisplay.textContent = confirmationCode;
        popUp.classList.remove("hidden");
    } else {
        console.error("Error: Elemen popUp dan kode unik tidak ditemukan.");
    }
}

const closeSuccessPopUp = () => {
    const popUp = document.getElementById("successPopUp");
    popUp.classList.add("hidden");
}


