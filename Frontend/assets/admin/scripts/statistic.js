var date_revenue = {};
var ordersCountByStatus = {};
var inputDayfrom = document.querySelector("#dayfrom");
var inputDayto = document.querySelector("#dayto");
var tittleRevenue = document.querySelector("#tittle-revenuechart");
var tittleStatus = document.querySelector("#tittle-statuschart");
var h1Alltimetotal = document.querySelector("#alltime-total h1");
var h1Orderscount = document.querySelector("#completeorderscount h1");
var dataContainer = document.querySelector('#data-container');
let overall;

var rtStatistic = setInterval(async () => {
    const updOverall = await getStatisticDataAPI('2022-01-01', '2022-01-01');
    if (JSON.stringify(updOverall) !== JSON.stringify(overall)) {
        overall = updOverall;
        renderOverAll(overall);
    }
}, 1000);
setUp();

async function setUp() {
    var today = new Date();
    inputDayto.value = dateFormatInput(today)
    inputDayfrom.value = dateFormatInput(new Date(today.setDate(today.getDate() - 7)));
    overall = await getStatisticDataAPI('2022-01-01', '2022-01-01');
    renderOverAll(overall);
    getStatisticData();
}

function dateFormatInput(date = new Date(), format = 'yyyy-mm-dd') {
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let month = date.getMonth() < 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);
    let result;

    switch (format) {
        case 'yyyy-mm-dd':
            result = `${date.getFullYear()}-${month}-${day}`;
            break;
        case 'dd/mm/yyyy':
            result = `${day}/${month}/${date.getFullYear()}`;
            break;
        default:
            break;
    }
    return result;
}

function monthFormatInput(date = new Date()) {
    let month = date.getMonth() < 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);

    return `${month}/${date.getFullYear()}`;
}

function getStatisticData() {
    const by = document.querySelector('#orderBy').value;

    let dateDayFrom = new Date(inputDayfrom.value);
    let dateDayTo = new Date(inputDayto.value);
    tittleRevenue.innerHTML = `Doanh thu từ ${dateFormatInput(dateDayFrom, 'dd/mm/yyyy')} đến ${dateFormatInput(dateDayTo, 'dd/mm/yyyy')}:`;
    tittleStatus.innerHTML = `Số đơn hàng theo trạng thái từ ${dateFormatInput(dateDayFrom, 'dd/mm/yyyy')} đến ${dateFormatInput(dateDayTo, 'dd/mm/yyyy')}:`;
    document.querySelector('#sum-order').innerText = '';
    document.querySelector('#sum-revenue').innerText = '';
    document.querySelector('#Placed').innerText = '';
    document.querySelector('#Confirm').innerText = '';
    document.querySelector('#Deliver').innerText = '';
    document.querySelector('#Complete').innerText = '';
    document.querySelector('#Cancel').innerText = '';
    switch (by) {
        case 'day':
            processDataByDay()
            break;
        case 'month':
            processDataByMonth()
            break;
        default:
            break;
    }
}

async function processDataByDay() {
    dataContainer.style.display = 'none'
    let dateDayFrom = new Date(inputDayfrom.value);
    let dateDayTo = new Date(inputDayto.value);

    if (dateDayFrom <= dateDayTo) {
        dataContainer.style.display = 'block'
        const data = await getStatisticDataAPI(dateFormatInput(dateDayFrom), dateFormatInput(dateDayTo));
        // Revenue
        console.log(data);
        const totalByDay = data.totalFromTo;
        date_revenue = {};
        while (dateDayFrom <= dateDayTo) {
            date_revenue[dateFormatInput(dateDayFrom)] = 0;
            let nextDay = dateDayFrom.getTime() + 86400000;
            dateDayFrom = new Date(nextDay);
        }
        totalByDay.forEach(day => {
            console.log(day);
            date_revenue[`${day._year}-${day._month}-${day._day}`] = day._total;
        });

        // Status count
        ordersCountByStatus = data.ordersByStatus;
        renderRevenueChart();
        renderPieChart();
    } else {
        notificationDialog('failure', 'Ngày bắt đầu phải trước ngày kết thúc');
        inputDayfrom.value = inputDayto.value;
    }
}

async function processDataByMonth() {
    dataContainer.style.display = 'none'
    let dateDayFrom = new Date(inputDayfrom.value);
    let dateDayTo = new Date(inputDayto.value);

    if (dateDayFrom <= dateDayTo) {
        dataContainer.style.display = 'block'
        const data = await getStatisticDataAPI(dateFormatInput(dateDayFrom), dateFormatInput(dateDayTo), 'month');
        console.log(data);
        // Revenue
        const totalByMonth = data.totalFromTo;
        date_revenue = {};
        while (dateDayFrom <= dateDayTo) {
            date_revenue[monthFormatInput(dateDayFrom)] = 0;
            let nextMonth = dateDayFrom.getTime() + (86400000 * 30);
            dateDayFrom = new Date(nextMonth);
        }
        totalByMonth.forEach(month => {
            date_revenue[`${month._month}/${month._year}`] = month._total;
        });

        // Status count
        ordersCountByStatus = data.ordersByStatus;
        renderRevenueChart();
        renderPieChart();
    } else {
        notificationDialog('failure', 'Ngày bắt đầu phải trước ngày kết thúc');
        inputDayfrom.value = inputDayto.value;
    }
}


function renderRevenueChart() {

    let totalRevenue = 0;
    let totalOrder = 0;
    totalRevenue = Object.values(date_revenue).reduce((total, val) => {
        return total + val;
    }, 0)
    totalOrder = Object.values(ordersCountByStatus).reduce((total, item) => {
        return total + Number(item.orderCount);
    }, 0)
    document.querySelector(`span#sum-order`).innerText = totalOrder + ' Đơn';
    document.querySelector(`span#sum-revenue`).innerText = priceFormat(totalRevenue) + ' VND';


    var xAsDate = Object.keys(date_revenue);
    var yAsRevenue = Object.values(date_revenue);
    // Define Data
    var data = [{
        x: xAsDate,
        y: yAsRevenue,
        type: String(document.querySelector('select#chartType').value)
    }];

    // Define Layout
    var layout = {
        xaxis: { range: xAsDate, title: "Ngày", type: 'category' },
        yaxis: { range: [0, Math.max(yAsRevenue * 1.1)], title: "Doanh thu" },
    };

    Plotly.newPlot("revenueChart", data, layout);
}

function renderPieChart() {
    var colors = [];
    var xArray = ordersCountByStatus.map(item => {
        var statusVn;
        switch (item.status) {
            case 'Placed':
                statusVn = 'Chờ xác nhận'
                colors.push('rgb(255, 127, 14)')
                break;
            case 'Confirm':
                statusVn = 'Đã xác nhận'
                colors.push('rgb(148, 103, 189)')
                break;
            case 'Assign':
                statusVn = 'Đã phân công'
                colors.push('rgb(235, 210, 52)')
                break;
            case 'Deliver':
                statusVn = 'Đang giao'
                colors.push('rgb(31, 119, 180)')
                break;
            case 'Complete':
                statusVn = 'Hoàn thành';
                colors.push('rgb(44, 160, 44)');
                break;
            case 'Cancel':
                statusVn = 'Bị hủy'
                colors.push('rgb(214, 39, 40)')
                break;
            default:
                break;
        }
        return statusVn
    })
    var yArray = ordersCountByStatus.map(item => {
        document.querySelector(`span#${item.status}`).innerText = item.orderCount + ' Đơn'
        return item.orderCount
    })

    var layout = { title: "Các đơn hàng theo trạng thái" };

    var data = [{ labels: xArray, values: yArray, type: "pie", marker: { colors: colors } }];

    Plotly.newPlot("statusCountChart", data, layout);
}

function renderOverAll(overall) {
    h1Alltimetotal.innerHTML = priceFormat(overall.today.revenue) + 'VND';
    h1Orderscount.innerHTML = overall.today.orderscount + ' Đơn Hàng';
}

async function exportPDF() {

    const lineHeight = 10;
    var callAddFont = function () {
        this.addFileToVFS('times.ttf', fontTimesNewRoman);
        this.addFont('times.ttf', 'times', 'normal');
        this.addFont('times.ttf', 'times', 'bold');
    };
    jsPDF.API.events.push(['addFonts', callAddFont]);

    let doc = new jsPDF()
    doc.setFont('times', 'bold');
    doc.setFontSize(16);

    doc.text(`                     THỐNG KÊ TỔNG HỢP 
    TỪ NGÀY ${dateFormatInput(new Date(inputDayfrom.value), 'dd/mm/yyyy')} ĐẾN NGÀY ${dateFormatInput(new Date(inputDayto.value), 'dd/mm/yyyy')}`, 40, 25);
    var revenueChartImg, statusCountChartImg;
    await Plotly.toImage('revenueChart', { format: 'png', width: 879, height: 650 }).then(function (dataURL) {
        revenueChartImg = dataURL;
    });

    await Plotly.toImage('statusCountChart', { format: 'png', width: 879, height: 650 }).then(function (dataURL) {
        statusCountChartImg = dataURL;
    });

    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.text(`I. Doanh thu từ ngày ${dateFormatInput(new Date(inputDayfrom.value), 'dd/mm/yyyy')} đến ngày ${dateFormatInput(new Date(inputDayto.value), 'dd/mm/yyyy')}`, 25, 44);
    doc.addImage(revenueChartImg, "png", 20, 45, 180, 133);

    // const tblRevenue = Object.keys(date_revenue).map(key => {
    //     const [year, month, day] = key.split('-');
    //     const time = [day, month, year].join('/');
    //     return {
    //         time: time,
    //         revenue: date_revenue[key]
    //     }
    // })
    // console.log(tblRevenue);
    // doc.table(tblRevenue, ['Thời gian', 'Doanh thu'], 20, 100)
    doc.addPage();
    doc.internal.getNumberOfPages();
    doc.text(`II. Số đơn hàng theo trạng thái từ ngày ${dateFormatInput(new Date(inputDayfrom.value), 'dd/mm/yyyy')} đến ngày ${dateFormatInput(new Date(inputDayto.value), 'dd/mm/yyyy')}`, 25, 25);
    doc.addImage(statusCountChartImg, "png", 20, 26, 180, 133);
    doc.save("output.pdf")
}