import { ChartType } from './dashboard.model';

const emailSentBarChart: ChartType = {
    chart: {
        height: 340,
        type: 'bar',
        stacked: true,
        toolbar: { show: false },
        zoom: { enabled: true }
    },
    plotOptions: {
        bar: { horizontal: false, columnWidth: '15%', endingShape: 'rounded' }
    },
    dataLabels: { enabled: false },
    series: [
        { name: 'Employés',    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: 'Stagiaires',  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: 'Congés',      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    ],
    xaxis: {
        categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    },
    colors: ['#2FA8A0', '#1A2B3C', '#F59E0B'],
    legend: { position: 'bottom' },
    fill: { opacity: 1 }
};

const monthlyEarningChart: ChartType = {
    chart: { height: 200, type: 'radialBar', offsetY: -10 },
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
                name: { fontSize: '13px', color: undefined, offsetY: 60 },
                value: {
                    offsetY: 22, fontSize: '16px', color: undefined,
                    formatter: (val: number) => val + '%'
                }
            }
        }
    },
    colors: ['#2FA8A0'],
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark', shadeIntensity: 0.15, inverseColors: false,
            opacityFrom: 1, opacityTo: 1, stops: [0, 50, 65, 91]
        }
    },
    stroke: { dashArray: 4 },
    series: [0],
    labels: ['Taux de présence']
};

export { emailSentBarChart, monthlyEarningChart };
