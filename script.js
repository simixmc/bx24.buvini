let BASE_URL = 'https://api.buvini.by/'
let COMPANY_ID = ''

BX24.init(app);

function app() {
    $( document ).ready(function () {
        $('#search').click(function () {
            $(this).addClass('disabled')
            $('#addInfoPanel').addClass('d-none')
            $('#companyInfoPanel').addClass('d-none')
            $('#loader').removeClass('d-none')
            $('#info').addClass('d-none')
            getEgr($('input[name="unp"]').val())
        })

        $('#addCompany').click(function () {
            $('#unp_add').val($('#unp').val())
            $('#name_add').val($('#name').val())
            $('#short_name_add').val($('#short_name').val())

            $('#address_add').val($('#address').val())
            $('#status_mns_add').val($('#status_mns').val())
            $('#egr_status_name_add').val($('#egr_status_name').val())
            $('#bankruptcy_add').val($('#bankruptcy').val())
            $('#liquidation_add').val($('#liquidation').val())
            $('#egr_brand_name_add').val($('#egr_brand_name').val())

            $('#addInfoPanel').removeClass('d-none')
        })

        $('#cancelCompanyDone').click(function () {
            $('#addInfoPanel').addClass('d-none')
            $('#addInfoPanel .form-control').val('')
        })

        $('#addCompanyDone').click(function () {
            let company = BX24.callMethod(
                "crm.company.list",
                {
                    filter: {'UF_CRM_1664531575783': $('#unp').val()},
                    select: ['*', 'UF_*']
                },
                function (result) {
                    if(result.error()) {
                        console.error(result.error());
                    } else {
                        if (typeof result.data() !== 'undefined' && result.data().length > 0) {
                            let company = result.data()[0]
                            $('#companyInfoPanel').removeClass('d-none')
                            $('#addInfoPanel').addClass('d-none')
                            COMPANY_ID = company.ID
                        } else {
                            addCompany()
                        }
                    }
                }
            )
        })

        $('#cancelCompanyUpdate').click(function () {
            $('#companyInfoPanel').addClass('d-none')
            $('#addInfoPanel').removeClass('d-none')
        })

        $('#updateCompanyDone').click(function () {
            updateCompany()
        })
    })
}

function addCompany () {
    console.log('ADD COMPANY')
    let fields = {
        "TITLE" : $('#name_add').val(),
        "OPENED": "Y",
        "REG_ADDRESS": $('#address_add').val(),
        "UF_CRM_1664531575783" : $('#unp_add').val(),
        "UF_CRM_1667657141784" : $('#short_name_add').val(),
        "UF_CRM_1680688558690" : $('#status_mns_add').val(),
        "UF_CRM_1680688581714" : $('#egr_status_name_add').val(),
        "UF_CRM_1680688596706" : $('#bankruptcy_add').val(),
        "UF_CRM_1680688618483" : $('#liquidation_add').val(),
        "UF_CRM_1680693572006" : $('#egr_brand_name_add').val(),
        "ASSIGNED_BY_ID": 1,
    }

    if ($('#phone_add').val() !== "") {
        fields['PHONE'] = [ { "VALUE": $('#phone_add').val(), "VALUE_TYPE": "WORK" } ]
    }

    if ($('#email_add').val() !== "") {
        fields['EMAIL'] = [ { "VALUE": $('#email_add').val(), "VALUE_TYPE": "WORK" } ]
    }

    console.log(fields)

    BX24.callMethod(
        "crm.company.add",
        {
            fields: fields,
            params: { "REGISTER_SONET_EVENT": "Y" }
        },
        function (result) {
            if(result.error()) {
                console.error(result.error());
                clearAll()
            }
            else {
                clearAll()
                let toast = new bootstrap.Toast(document.getElementById('addCompanyToast'))
                $('#addCompanyInfoID').text("Создана компания с ID " + result.data())
                toast.show()
            }
        }
    )
}

function updateCompany () {
    console.log('UPDATE COMPANY')

    let fields = {
        "TITLE" : $('#name_add').val(),
        "OPENED": "Y",
        "REG_ADDRESS": $('#address_add').val(),
        "UF_CRM_1664531575783" : $('#unp_add').val(),
        "UF_CRM_1667657141784" : $('#short_name_add').val(),
        "UF_CRM_1680688558690" : $('#status_mns_add').val(),
        "UF_CRM_1680688581714" : $('#egr_status_name_add').val(),
        "UF_CRM_1680688596706" : $('#bankruptcy_add').val(),
        "UF_CRM_1680688618483" : $('#liquidation_add').val(),
        "UF_CRM_1680693572006" : $('#egr_brand_name_add').val()
    }

    if ($('#phone_add').val() !== "") {
        fields['PHONE'] = [ { "VALUE": $('#phone_add').val(), "VALUE_TYPE": "WORK" } ]
    }

    if ($('#email_add').val() !== "") {
        fields['EMAIL'] = [ { "VALUE": $('#email_add').val(), "VALUE_TYPE": "WORK" } ]
    }

    console.log(fields)

    BX24.callMethod(
        "crm.company.update",
        {
            id: COMPANY_ID,
            fields: fields,
            params: { "REGISTER_SONET_EVENT": "Y" }
        },
        function (result) {
            if(result.error()) {
                console.error(result.error());
                clearAll()
            }
            else {
                let toast = new bootstrap.Toast(document.getElementById('updateCompanyToast'))
                $('#updateCompanyInfoID').text("Компания обновлена с ID " + COMPANY_ID)
                toast.show()
                clearAll()
            }
        }
    )
}

function clearAll () {
    $('#addInfoPanel').addClass('d-none')
    $('#companyInfoPanel').addClass('d-none')
    clearInfo()
}

function getEgr (unp) {
    (async function() {
        result = await (await fetch(BASE_URL + '?unp=' + unp)).json();
        checkInfo(result)
    })();
}

function checkInfo (data) {
    console.log(data)
    $('#search').removeClass('disabled')
    $('#btnAddCompany').removeClass('d-none')
    clearInfo()
    if (data.error) {
        if (parseInt(data['mess']['limit']['day_limit']) !== 0) {
            $('#alert-danger').removeClass('d-none')
            $('#btnAddCompany').addClass('d-none')
        } else {
            $('#alert-limit').removeClass('d-none')
            $('#btnAddCompany').addClass('d-none')
        }
    } else {
        let d = data.data.Summary;

        $('#alert-danger').addClass('d-none')

        for (const [key, value] of Object.entries(d)) {
            console.log(value)
            switch (key) {
                case 'bankruptcy':
                    $('#' + key).val(value['status'] || 'Контрагент не находится в процессе банкротства')
                    break
                case 'liquidation':
                    $('#' + key).val(value['current_status'] || 'Объявления не публиковались')
                    break
                default:
                    $('#' + key).val(value)
            }

        }
    }

    $('#info').removeClass('d-none')
    $('#loader').addClass('d-none')
}

function clearInfo () {
    $('#info .form-control').val('')
    $('#addInfoPanel .form-control').val('')
    COMPANY_ID = ''
}