import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import Papa from 'papaparse';
import { Box, Button, Card, CardProps, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import type { ChartOptions } from 'src/components/chart';

import { useEffect, useState } from 'react';
import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';
import 'src/global.css';

// ----------------------------------------------------------------------

// CSV 中取得的資料結構
interface ChartData {
  timestamp: string;
  carCount: number;
  motorcycleCount: number;
  busCount: number;
  truckCount: number;
  totalCount: number;
  roadcondition: string;
}

type Props = CardProps & {
  // title?: string;
  // subheader?: string;
  chart?: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ChartOptions;
  };
};

export function OverviewAnalyticsView() {
  const [chartData, setChartData] = useState<ChartData[]>([]); // 車流量圓餅圖資料
  const theme = useTheme();
  
  // 車流量
  useEffect(() => {
    fetch("traffic_predict/assets/csv/vehicle_count.csv")
      .then((response) => response.blob()) // 使用 blob 讀取檔案
      .then((blob) => {

        const reader = new FileReader();
        reader.onload = () => {
          const csvText = reader.result as string; // 直接將讀取結果視為字串          
          Papa.parse(csvText, {
            header: true, // 解析第一行作為標題
            skipEmptyLines: true,
            complete: (result: Papa.ParseResult<any>) => {
              console.log("讀取到vehicle_count.csv檔資料:", result.data);
              
              // 轉換數據格式適應 `AnalyticsCurrentVisits`
              const formattedData = result.data.map((row) => ({
                timestamp: row.Timestamp, // 保持時間格式
                carCount: Number(row['Car Count']), // 轉成數字
                motorcycleCount: Number(row['Motorcycle Count']),
                busCount: Number(row['Bus Count']),
                truckCount: Number(row['Truck Count']),
                totalCount: Number(row['Total Count']),
                roadcondition: row['Road Condition'],
                
              }));
              setChartData(formattedData);  // 設定處理後的資料
              
            },
          });
        };
        reader.readAsText(blob, "UTF-8");  
      })
      .catch((error) => console.error("未讀取到vehicle_count.csv資料:", error));
  }, []);

  // 設定每次只顯示10筆
  const crowedlimitpage = 10; // 每頁顯示 10 筆資料
  const [crowedCurrentPage, setCrowedCurrentPage] = useState(1); // 當前頁數
  const [crowedPageNum, setcrowedPageNum] = useState<number>(); // 總頁數

  // 計算每頁顯示的資料範圍
  const [crowedSearchDate, setcrowedSearchDate] = useState(''); // 搜尋日期存放
  const [searchCrowedData, setSearchCrowedData] = useState<ChartData[]>(chartData); // 搜尋日期過後壅塞狀態資料
  const startCrowedIndex = (crowedCurrentPage - 1) * crowedlimitpage; 
  const endCrowedIndex = startCrowedIndex + crowedlimitpage; 

  // 切分顯示資料
  const crowedDataToDisplay = searchCrowedData.slice(startCrowedIndex, endCrowedIndex);

  // 依照日期搜尋車流量壅塞狀態
  const handleCarCrowedSearch = () => {
    setCrowedCurrentPage(1);
    // 如果未輸入任何日期，則返回所有資料
    let filteredData = chartData;
    if (crowedSearchDate.trim() !== '') {
      // 篩選符合日期的資料
      filteredData = chartData.filter(data =>
        data.timestamp.startsWith(crowedSearchDate)
      );
    }
    setSearchCrowedData(filteredData);
    setcrowedPageNum(Math.ceil(filteredData.length / crowedlimitpage));
  };

  // 上一頁
  const crowedprevPage = () => {
    if (crowedCurrentPage > 1) {
      setCrowedCurrentPage(crowedCurrentPage - 1);
    }
  };

  // 下一頁
  const crowednextPage = () => {
    if (crowedCurrentPage !== crowedPageNum) {
      setCrowedCurrentPage(crowedCurrentPage + 1);
    }
  };
    
  return (
    <DashboardContent maxWidth="xl">
      {/* <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome👋
      </Typography> */}

      <Grid container spacing={3}>
        {/* <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Weekly sales"
            percent={2.6}
            total={714000}
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="New users"
            percent={-0.1}
            total={1352831}
            color="secondary"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Purchase orders"
            percent={2.8}
            total={1723315}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Messages"
            percent={3.6}
            total={234}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid> */}
        
        {/* 車流量折線圖 */}
        <Grid xs={12} md={12} lg={12}>
          <Card elevation={3} sx={{ padding: 3, marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              車流量折線圖
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={crowedDataToDisplay} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="carCount" stroke={theme.palette.primary.main} name="汽車" strokeWidth={3} />
                <Line type="monotone" dataKey="motorcycleCount" stroke={theme.palette.warning.main} name="機車" strokeWidth={3} />
                <Line type="monotone" dataKey="busCount" stroke={theme.palette.secondary.dark} name="公車" strokeWidth={3}/>
                <Line type="monotone" dataKey="truckCount" stroke={theme.palette.error.main} name="卡車" strokeWidth={3} />          
              </LineChart>
            </ResponsiveContainer>

            {/* 搜尋輸入框 */}
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                label="日期 (YYYY/MM/DD)"
                variant="outlined"
                size="small"
                value={crowedSearchDate}
                onChange={(e) => setcrowedSearchDate(e.target.value)}
              />
              <Button variant="contained" onClick={handleCarCrowedSearch}>查詢</Button>
            </Box>
            <Box mt={2}>
              {/* 顯示資料 */}
              {crowedDataToDisplay.map((data, index) => (
                <Box key={index} display="flex" justifyContent="space-between">
                  <Typography variant="h6">{data.timestamp}</Typography>
                  <Typography variant="h6" color={data.roadcondition === 'Crowed' ? 'error' : 'green'}>
                    {data.roadcondition === 'Crowed'? '壅塞': '暢通'}
                  </Typography>
                </Box>
              ))}

              {/* 換頁按鈕 */}
              {crowedPageNum !== undefined && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button onClick={crowedprevPage} disabled={crowedCurrentPage === 1}>
                    上一頁
                  </Button>
                  <span style={{ margin: '0 10px' }}>{`${crowedCurrentPage}/${crowedPageNum}`}</span>
                  <Button onClick={crowednextPage} disabled={crowedCurrentPage === crowedPageNum}>
                    下一頁
                  </Button>
                </Box>
              )}
            </Box>          
          </Card>
        </Grid>

        {/* 車流量圓餅圖 */}
        <Grid xs={12} md={12} lg={12}>
          <AnalyticsCurrentVisits
            title="車流量圓餅圖"
            chart={{
              series: [
                { 
                  label: '普通汽車數量', value: searchCrowedData.reduce((sum, row) => sum + row.carCount, 0) 
                },
                { 
                  label: '機車數量', value: searchCrowedData.reduce((sum, row) => sum + row.motorcycleCount, 0) 
                },
                { 
                  label: '公車數量', value: searchCrowedData.reduce((sum, row) => sum + row.busCount, 0) 
                },
                { 
                  label: '卡車數量', value: searchCrowedData.reduce((sum, row) => sum + row.truckCount, 0) 
                },
              ],
            }}
          />
          <Box mt={2} display="flex" justifyContent="center">
            {searchCrowedData && searchCrowedData.length > 0 && (
              <Typography variant="h6">
                總車流量: 
                {searchCrowedData.reduce((sum, row) => sum + row.carCount + row.motorcycleCount + row.busCount + row.truckCount, 0)}
              </Typography>
            )}
          </Box>
        </Grid>
        

        {/* <Grid xs={12} md={12} lg={12}>
          <AnalyticsWebsiteVisits
            title="交通違規統計"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} md={12} lg={12}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
              series: [
                { name: '2022', data: [44, 55, 41, 64, 22] },
                { name: '2023', data: [53, 32, 33, 52, 13] },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} md={12} lg={12}>
          <AnalyticsCurrentSubject
            title="Current subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={4}>
          <AnalyticsTrafficBySite
            title="Traffic by site"
            list={[
              { value: 'facebook', label: 'Facebook', total: 323234 },
              { value: 'google', label: 'Google', total: 341212 },
              { value: 'linkedin', label: 'Linkedin', total: 411213 },
              { value: 'twitter', label: 'Twitter', total: 443232 },
            ]}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={8}>
          <AnalyticsTasks title="Tasks" list={_tasks} />
        </Grid> */}
      </Grid>
    </DashboardContent>
  );
}
