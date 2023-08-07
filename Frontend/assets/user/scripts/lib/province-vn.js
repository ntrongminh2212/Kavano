// getData();
// const ulProvince = document.querySelector("#ulProvince");
// const ulDistrict = document.querySelector("#ulDistrict");
// const ulWard = document.querySelector("#ulWard");
const ulLocation = document.querySelector("#ulLocation");
let provinces, districts, wards;
let locations;
let selectedLoc;
let timeOuts = [];

// async function getData() {
//     provinces = await fetch('../constant/address.json')
//         .then((res) => res.json())
//     renderProvinces();
// }

// function selectProvince(li) {
//     document.querySelector('#ward').value = '';
//     document.querySelector('#district').value = '';
//     const code = li.getAttribute('code')
//     let input = document.querySelector('#province');
//     const province = provinces.find((province) => {
//         return province.code == code
//     })
//     input.value = province.name;
//     districts = province.districts;
//     renderDistricts(province.districts);
// }

// function selectDistrict(li) {
//     document.querySelector('#ward').value = '';
//     const code = li.getAttribute('code')
//     let input = document.querySelector('#district');
//     const district = districts.find((district) => {
//         return district.code == code
//     })
//     input.value = district.name;
//     wards = district.wards
//     renderWards(district.wards);
// }

// function selectWard(li) {
//     const code = li.getAttribute('code')
//     let input = document.querySelector('#ward');
//     const ward = wards.find((ward) => {
//         return ward.code == code
//     })
//     input.value = ward.name;
// }

function selectLocation(li = "") {
    let input = document.querySelector('#address');
    if (li) {
        const code = li.getAttribute('code')
        selectedLoc = locations.find((loc) => {
            return loc.place_id == code
        })
        input.value = selectedLoc.display_name

        setMarkerCoord(selectedLoc.lat, selectedLoc.lon);
    } else {
        input.value = selectedLoc.display_name
    }
}

function geocodeApi(street, place_id = '') {
    // return `https://nominatim.openstreetmap.org/search.php?street=${street}&city=${city}&county=${county}&state=${state}`
    //     + (place_id ? `&exclude_place_ids=${place_id}` : '')
    //     + `&format=jsonv2`
    // street = street.replaceAll(' ', '+');
    return `https://nominatim.openstreetmap.org/search.php?q=${street}&addressdetails=1`
        + (place_id ? `&exclude_place_ids=${place_id}` : '')
        + `&format=jsonv2`
}

function geoCodeAPI() {
    // let state = document.querySelector('#province').value;
    // let county = document.querySelector('#district').value;
    // let city = document.querySelector('#ward').value;
    // if (state && county && city && street) {
    let street = document.querySelector('#address').value;
    if (street) {
        street += ', Thành phố Hồ Chí Minh';
        ulLocation.innerHTML = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
        for (var i = 0; i < timeOuts.length; i++) {
            clearTimeout(timeOuts[i]);
        }
        timeOuts.push(setTimeout(async () => {
            locations = await fetch(geocodeApi(street), requestOption('GET'))
                .then((res) => {
                    return res.json()
                })
            console.log(locations);
            if (locations.length > 0) {
                // locations = await fetch(geocodeApi(street, locations[0].place_id), requestOption('GET'))
                //     .then((res) => {
                //         return res.json()
                //     })
                console.log(locations);
                renderAddress(locations)
            } else {
                ulLocation.innerHTML = `<li x-html='highlightName(item)'
            class='px-2 py-1 cursor-pointer bg-white hover:bg-blue-100'>Không tìm thấy kết quả phù hợp</li>`;
            }
        }, 800));
    }
}

// function renderProvinces() {
//     ulProvince.innerHTML = provinces.map((province) => {
//         return `<li x-html='highlightName(item)' code='${province.code}'
//     class='px-2 py-1 cursor-pointer bg-white hover:bg-blue-100'
//     onclick="selectProvince(this)">${province.name}</li>`
//     }).join('')
// }

// function renderDistricts(districts) {
//     ulDistrict.innerHTML = districts.map((district) => {
//         return `<li x-html='highlightName(item)' code='${district.code}'
//     class='px-2 py-1 cursor-pointer bg-white hover:bg-blue-100'
//     onclick="selectDistrict(this)">${district.name}</li>`
//     }).join('')
// }

// function renderWards(wards) {
//     ulWard.innerHTML = wards.map((ward) => {
//         return `<li x-html='highlightName(item)' code='${ward.code}'
//     class='px-2 py-1 cursor-pointer bg-white hover:bg-blue-100'
//     onclick="selectWard(this)">${ward.name}</li>`
//     }).join('')
// }

function renderAddress(locations) {
    ulLocation.innerHTML = locations.map((location) => {
        const index = location.display_name.lastIndexOf(',')
        return `<li x-html="highlightName(item)" code="${location.place_id}"
        class="row px-2 py-1 cursor-pointer bg-white hover:bg-blue-100"
        onclick="selectLocation(this)" style="align-items: center;">
        <i class="fa-solid fa-location-dot col-1" style="font-size: 20;"></i>
        <span class="col-11">${location.display_name.substring(0, index)}</span>
    </li>`
    }).join('')
}
