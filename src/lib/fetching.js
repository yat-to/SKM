import { API_ROUTES } from '@/store/appSlice';

export const getMasterMenu = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(API_ROUTES.URL_DM_KLP_USERS + "listAdd", {
        method: "GET",
        headers: {
            "authorization": "kikensbatara " + token
        }
    });
    const res_data = await res.json();
    return res_data;
};

export const postMasterMenu = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(API_ROUTES.URL_DM_KLP_USERS + "listEdit", {
        method: "POST",
        headers: { 
            "content-type": "application/json",
            "authorization": "kikensbatara " + token 
        },
        body: JSON.stringify({
            menu_klp_id: id,
        })
    });
    const res_data = await res.json();
    return res_data;
};

export const getAset = (setList) => {
    const token = localStorage.getItem('token');
    fetch(API_ROUTES.URL_ASET + "akun", {
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "authorization": "kikensbatara " + token
        },
        body: JSON.stringify({})
    })
        .then(res => res.json())
        .then(res_data => {
            // console.log(res_data);
            setList(res_data.data || []);
        });
};

export const getKelompok = (akunId, setList) => {
    const token = localStorage.getItem('token');
    fetch(API_ROUTES.URL_ASET + "kelompok", {
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "authorization": "kikensbatara " + token
        },
        body: JSON.stringify({
            akunId: akunId
        })
    })
        .then(res => res.json())
        .then(res_data => {
            // console.log(res_data);
            setList(res_data.data || []);
        });
};

export const getJenis = (kelompokId, setList) => {
    const token = localStorage.getItem('token');
    fetch(API_ROUTES.URL_ASET + "jenis", {
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "authorization": "kikensbatara " + token
        },
        body: JSON.stringify({
            kelompokId: kelompokId
        })
    })
        .then(res => res.json())
        .then(res_data => {
            // console.log(res_data);
            setList(res_data.data || []);
        });
};

export const getObjek = (jenisId, setList) => {
    const token = localStorage.getItem('token');
    fetch(API_ROUTES.URL_ASET + "objek", {
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "authorization": "kikensbatara " + token
        },
        body: JSON.stringify({
            jenisId: jenisId
        })
    })
        .then(res => res.json())
        .then(res_data => {
            // console.log(res_data);
            setList(res_data.data || []);
        });
};

export const getRincian = (objekId, setList) => {
    const token = localStorage.getItem('token');
    fetch(API_ROUTES.URL_ASET + "rincian", {
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "authorization": "kikensbatara " + token
        },
        body: JSON.stringify({
            objekId: objekId
        })
    })
        .then(res => res.json())
        .then(res_data => {
            // console.log(res_data);
            setList(res_data.data || []);
        });
};

export const getSub = (rincianId, setList) => {
    const token = localStorage.getItem('token');
    fetch(API_ROUTES.URL_ASET + "sub", {
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "authorization": "kikensbatara " + token
        },
        body: JSON.stringify({
            rincianId: rincianId
        })
    })
        .then(res => res.json())
        .then(res_data => {
            // console.log(res_data);
            setList(res_data.data || []);
        });
};

export const getSubSub = (subId, setList) => {
    const token = localStorage.getItem('token');
    fetch(API_ROUTES.URL_ASET + "subSub", {
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "authorization": "kikensbatara " + token
        },
        body: JSON.stringify({
            subId: subId
        })
    })
        .then(res => res.json())
        .then(res_data => {
            // console.log(res_data);
            setList(res_data.data || []);
        });
};