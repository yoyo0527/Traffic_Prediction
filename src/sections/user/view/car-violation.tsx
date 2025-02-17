import { useState, useCallback, useEffect } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import * as XLSX from 'xlsx';
import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { Paper, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics-website-visits';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import type { UserProps } from '../user-table-row';

// ----------------------------------------------------------------------

export function UserView() {
  const [violationsData, setViolationsData] = useState<any[]>([]); // 車輛違規資料

  // 違規車輛
  useEffect(() => {
    fetch("/Traffic_Prediction/assets/csv/car_violations.xlsx")  // 讀取 Excel 檔案
      .then((response) => response.arrayBuffer()) // 轉換為 ArrayBuffer
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0]; // 取得第一個工作表
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { raw: false });

        // 格式化日期欄位
        const formattedData = rawData.map((row: any) => ({
          ...row,
          違規日期: row.違規日期 ? new Date(row.違規日期).toISOString().split("T")[0] : "未知日期"
        }));

        console.log("讀取到car_violations.xlsx資料:", formattedData);
        setViolationsData(formattedData); // 存放轉換完的資料
      })
      .catch((error) => console.error("未讀到car_violations.xlsx資料:", error));
  }, [])
  
  // 設定每次只顯示10筆
  const violationslimitpage = 10; // 每頁顯示 10 筆資料
  const [violationsCurrentPage, setViolationsCurrentPage] = useState(1); // 當前頁數
  const [violationsPageNum, setviolationsPageNum] = useState<number>(); // 總頁數

  const [violationsSearchDate, setviolationsSearchDate] = useState(''); // 搜尋日期
  const [searchViolationsData, setSearchViolationsData] = useState(violationsData); // 搜尋日期過後違規車輛
  const [violationsSearchLicense, setviolationsSearchLicense] = useState(''); // 搜尋車牌
  const startViolationsIndex = (violationsCurrentPage - 1) * violationslimitpage; 
  const endViolationsIndex = startViolationsIndex + violationslimitpage; 

  // 切分顯示資料
  const violationsDataToDisplay = searchViolationsData.slice(startViolationsIndex, endViolationsIndex);

  // 搜尋違規車輛
  const handleCarViolationsSearch = () => {
    setViolationsCurrentPage(1);
    // 如果未輸入查詢條件，則返回所有資料
    let filteredData = violationsData;
    if (violationsSearchDate.trim() !== '' || violationsSearchLicense.trim() !== '') {
      // 篩選符合日期的資料
      filteredData = violationsData.filter(data =>{
        const resultDateData = violationsSearchDate ? data.違規日期.startsWith(violationsSearchDate) : true;
        const resultLicenseData = violationsSearchLicense ? data.違規車輛車牌.includes(violationsSearchLicense) : true;
        return (resultDateData && resultLicenseData);
      });
    }
    setSearchViolationsData(filteredData);
    setviolationsPageNum(Math.ceil(filteredData.length / violationslimitpage));
  };

  // 上一頁
  const violationsprevPage = () => {
    if (violationsCurrentPage > 1) {
      setViolationsCurrentPage(violationsCurrentPage - 1);
    }
  };

  // 下一頁
  const violationsnextPage = () => {
    if (violationsCurrentPage !== violationsPageNum) {
      setViolationsCurrentPage(violationsCurrentPage + 1);
    }
  };

  // 取得違規資料的月份統計
  const violationsMonthCount = () => {
    const monthlyEventCounts: { [key: string]: { [key: string]: number } } = {
      '1': {}, '2': {}, '3': {}, '4': {}, '5': {}, '6': {}, '7': {}, 
      '8': {}, '9': {}, '10': {}, '11': {}, '12': {}
    };

    searchViolationsData.forEach(data => {
      const month = parseInt(data.違規日期.split('-')[1], 10); // 取得月份索引 (1-12)
      const violationType = data.違規事項;

      // 如果該月沒有該違規類型，則初始化該違規類型的計數
      if (!monthlyEventCounts[month][violationType]) {
        monthlyEventCounts[month][violationType] = 0;
      }
      // 統計每月每個違規事件的數量
      monthlyEventCounts[month][violationType] += 1;
    });
    return monthlyEventCounts; 
  };

  // 將統計資料轉換為圖表所需格式
  const violationsChartData = () => {
    const monthEventCounts = violationsMonthCount();
    const categories = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    // 收集所有違規事件類型
    const violationTypes = Array.from(
      new Set(violationsData.map(data => data.違規事項)) // 確保每個違規類型只出現一次
    );

    const series = violationTypes.map(violationType => ({
      name: violationType, 
      data: categories.map(month => monthEventCounts[month][violationType] || 0) // 如果沒有違規事件則設為 0
    }));

    return { categories, series };
  };  

  return (
    <DashboardContent>
      <Grid container spacing={3}>
        {/* 車輛違規統計 */}
        <Grid xs={12} md={12} lg={12}>
          <Card elevation={3} sx={{ padding: 3, marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              車輛違規查詢
            </Typography>
            {/* 搜尋輸入框 */}
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                label="<選填>日期 (YYYY-MM-DD)"
                variant="outlined"
                size="small"
                value={violationsSearchDate}
                onChange={(e) => setviolationsSearchDate(e.target.value)}
              />
              <TextField
                label="<選填>車牌(xxx-xxxx)"
                variant="outlined"
                size="small"
                value={violationsSearchLicense}
                onChange={(e) => setviolationsSearchLicense(e.target.value)}
              />
              <Button variant="contained" onClick={handleCarViolationsSearch}>查詢</Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {violationsData.length > 0 &&
                      Object.keys(violationsData[0]).map((key) => (
                        <TableCell key={key} style={{ fontWeight: "bold" }}>
                          {key}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {violationsDataToDisplay.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, idx) => (
                        <TableCell key={idx}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* 換頁按鈕 */}
            {violationsPageNum !== undefined && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button onClick={violationsprevPage} disabled={violationsCurrentPage === 1}>
                  上一頁
                </Button>
                <span style={{ margin: '0 10px' }}>{`${violationsCurrentPage}/${violationsPageNum}`}</span>
                <Button onClick={violationsnextPage} disabled={violationsCurrentPage === violationsPageNum}>
                  下一頁
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        <Grid xs={12} md={12} lg={12}>
          <AnalyticsWebsiteVisits
            title="交通違規統計"
            chart={violationsChartData()}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

// export function useTable() {
//   const [page, setPage] = useState(0);
//   const [orderBy, setOrderBy] = useState('name');
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [selected, setSelected] = useState<string[]>([]);
//   const [order, setOrder] = useState<'asc' | 'desc'>('asc');

//   const onSort = useCallback(
//     (id: string) => {
//       const isAsc = orderBy === id && order === 'asc';
//       setOrder(isAsc ? 'desc' : 'asc');
//       setOrderBy(id);
//     },
//     [order, orderBy]
//   );

//   const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
//     if (checked) {
//       setSelected(newSelecteds);
//       return;
//     }
//     setSelected([]);
//   }, []);

//   const onSelectRow = useCallback(
//     (inputValue: string) => {
//       const newSelected = selected.includes(inputValue)
//         ? selected.filter((value) => value !== inputValue)
//         : [...selected, inputValue];

//       setSelected(newSelected);
//     },
//     [selected]
//   );

//   const onResetPage = useCallback(() => {
//     setPage(0);
//   }, []);

//   const onChangePage = useCallback((event: unknown, newPage: number) => {
//     setPage(newPage);
//   }, []);

//   const onChangeRowsPerPage = useCallback(
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       setRowsPerPage(parseInt(event.target.value, 10));
//       onResetPage();
//     },
//     [onResetPage]
//   );

//   return {
//     page,
//     order,
//     onSort,
//     orderBy,
//     selected,
//     rowsPerPage,
//     onSelectRow,
//     onResetPage,
//     onChangePage,
//     onSelectAllRows,
//     onChangeRowsPerPage,
//   };
// }
