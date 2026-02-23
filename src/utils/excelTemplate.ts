import * as XLSX from 'xlsx'

export interface ClassTemplateRow {
  '班级名称': string
  '年级': string
  '描述': string
}

export interface StudentTemplateRow {
  '姓名': string
  '性别': string
  '学号': string
}

export interface ScoreTemplateRow {
  '学生姓名': string
  '学号': string
  '语文(满分150)': string
  '数学(满分150)': string
  '英语(满分150)': string
  '物理(满分100)': string
  '化学(满分100)': string
  '化学赋分(满分100)': string
  '生物(满分100)': string
  '生物赋分(满分100)': string
  '历史(满分100)': string
  '政治(满分100)': string
  '政治赋分(满分100)': string
  '地理(满分100)': string
  '地理赋分(满分100)': string
}

export const downloadClassTemplate = () => {
  const data: ClassTemplateRow[] = [
    { '班级名称': '高一1班', '年级': '高一', '描述': '重点班' },
    { '班级名称': '高一2班', '年级': '高一', '描述': '普通班' },
    { '班级名称': '高二1班', '年级': '高二', '描述': '' }
  ]

  const ws = XLSX.utils.json_to_sheet(data)
  const colWidths = [
    { wch: 15 },
    { wch: 10 },
    { wch: 20 }
  ]
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '班级导入模板')

  XLSX.writeFile(wb, '班级导入模板.xlsx')
}

export const downloadStudentTemplate = () => {
  const data: StudentTemplateRow[] = [
    { '姓名': '张三', '性别': '男', '学号': '2024001' },
    { '姓名': '李四', '性别': '女', '学号': '2024002' },
    { '姓名': '王五', '性别': '男', '学号': '2024003' }
  ]

  const ws = XLSX.utils.json_to_sheet(data)
  const colWidths = [
    { wch: 10 },
    { wch: 8 },
    { wch: 15 }
  ]
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '学生导入模板')

  XLSX.writeFile(wb, '学生导入模板.xlsx')
}

export const downloadScoreTemplate = (examName: string, students: { name: string; student_number: string }[]) => {
  const headerRow: ScoreTemplateRow = {
    '学生姓名': '张三',
    '学号': '2024001',
    '语文(满分150)': '120',
    '数学(满分150)': '135',
    '英语(满分150)': '128',
    '物理(满分100)': '85',
    '化学(满分100)': '78',
    '化学赋分(满分100)': '',
    '生物(满分100)': '82',
    '生物赋分(满分100)': '',
    '历史(满分100)': '75',
    '政治(满分100)': '80',
    '政治赋分(满分100)': '',
    '地理(满分100)': '72',
    '地理赋分(满分100)': ''
  }

  const data: ScoreTemplateRow[] = students.length > 0 
    ? students.map(student => ({
        '学生姓名': student.name,
        '学号': student.student_number,
        '语文(满分150)': '',
        '数学(满分150)': '',
        '英语(满分150)': '',
        '物理(满分100)': '',
        '化学(满分100)': '',
        '化学赋分(满分100)': '',
        '生物(满分100)': '',
        '生物赋分(满分100)': '',
        '历史(满分100)': '',
        '政治(满分100)': '',
        '政治赋分(满分100)': '',
        '地理(满分100)': '',
        '地理赋分(满分100)': ''
      }))
    : [headerRow]

  const ws = XLSX.utils.json_to_sheet(data)
  const colWidths = [
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 }
  ]
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '成绩导入模板')

  const fileName = examName ? `${examName}_成绩导入模板.xlsx` : '成绩导入模板.xlsx'
  XLSX.writeFile(wb, fileName)
}

export const parseExcelFile = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

export const parseClassExcel = (data: ClassTemplateRow[]): { name: string; grade?: string; description?: string }[] => {
  return data
    .filter(row => row['班级名称'] && row['班级名称'].trim())
    .map(row => ({
      name: row['班级名称'].trim(),
      grade: row['年级']?.trim() || undefined,
      description: row['描述']?.trim() || undefined
    }))
}

export const parseStudentExcel = (data: StudentTemplateRow[]): { name: string; gender: string; student_number: string }[] => {
  return data
    .filter(row => row['姓名']?.trim() && row['性别']?.trim() && row['学号']?.trim())
    .map(row => ({
      name: row['姓名'].trim(),
      gender: row['性别'].trim(),
      student_number: row['学号'].trim()
    }))
}

const getScoreValue = (row: Record<string, any>, keys: string[]): number | null => {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== '' && value !== null) {
      const num = parseFloat(String(value))
      if (!isNaN(num)) return num
    }
  }
  return null
}

export const parseScoreExcel = (data: ScoreTemplateRow[]): { student_number: string; student_name: string; scores: Record<string, number | null> }[] => {
  return data
    .filter(row => {
      const studentNumber = row['学号']?.trim() || (row as any)['学号']?.trim()
      return studentNumber
    })
    .map(row => {
      const rowAny = row as any
      const scores: Record<string, number | null> = {}
      
      scores.chinese = getScoreValue(rowAny, ['语文(满分150)', '语文'])
      scores.math = getScoreValue(rowAny, ['数学(满分150)', '数学'])
      scores.english = getScoreValue(rowAny, ['英语(满分150)', '英语'])
      scores.physics = getScoreValue(rowAny, ['物理(满分100)', '物理'])
      scores.chemistry = getScoreValue(rowAny, ['化学(满分100)', '化学'])
      scores.chemistry_assigned = getScoreValue(rowAny, ['化学赋分(满分100)', '化学赋分'])
      scores.biology = getScoreValue(rowAny, ['生物(满分100)', '生物'])
      scores.biology_assigned = getScoreValue(rowAny, ['生物赋分(满分100)', '生物赋分'])
      scores.history = getScoreValue(rowAny, ['历史(满分100)', '历史'])
      scores.politics = getScoreValue(rowAny, ['政治(满分100)', '政治'])
      scores.politics_assigned = getScoreValue(rowAny, ['政治赋分(满分100)', '政治赋分'])
      scores.geography = getScoreValue(rowAny, ['地理(满分100)', '地理'])
      scores.geography_assigned = getScoreValue(rowAny, ['地理赋分(满分100)', '地理赋分'])
      
      return {
        student_number: row['学号']?.trim() || rowAny['学号']?.trim() || '',
        student_name: row['学生姓名']?.trim() || rowAny['学生姓名']?.trim() || '',
        scores
      }
    })
}
