import apiClient from './index'

export interface SchoolResponse {
  id: string
  name: string
  address: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface SchoolCreate {
  name: string
  address?: string
  description?: string
}

export interface SchoolUpdate {
  name?: string
  address?: string
  description?: string
}

export interface ClassResponse {
  id: string
  name: string
  grade: string | null
  description: string | null
  school_id: string
  created_at: string
  updated_at: string
}

export interface ClassCreate {
  name: string
  school_id: string
  grade?: string
  description?: string
}

export interface ClassUpdate {
  name?: string
  grade?: string
  description?: string
}

export interface StudentResponse {
  id: string
  name: string
  gender: string
  student_number: string
  class_id: string
  created_at: string
  updated_at: string
}

export interface StudentCreate {
  name: string
  gender: string
  student_number: string
  class_id: string
}

export interface StudentUpdate {
  name?: string
  gender?: string
  student_number?: string
  class_id?: string
}

export interface ClassBatchItem {
  name: string
  grade?: string
  description?: string
}

export interface ClassBatchCreate {
  school_id: string
  classes: ClassBatchItem[]
}

export interface StudentBatchItem {
  name: string
  gender: string
  student_number: string
}

export interface StudentBatchCreate {
  class_id: string
  students: StudentBatchItem[]
}

export interface BatchImportResult {
  success_count: number
  fail_count: number
  errors: string[]
}

export interface ExamResponse {
  id: string
  name: string
  exam_date: string
  exam_type: string | null
  school_id: string
  created_at: string
  updated_at: string
}

export interface ExamCreate {
  name: string
  exam_date: string
  school_id: string
  exam_type?: string
}

export interface ExamUpdate {
  name?: string
  exam_date?: string
  exam_type?: string
}

export interface ScoreResponse {
  id: string
  student_id: string
  exam_id: string
  chinese: number | null
  math: number | null
  english: number | null
  physics: number | null
  history: number | null
  chemistry: number | null
  chemistry_assigned: number | null
  biology: number | null
  biology_assigned: number | null
  politics: number | null
  politics_assigned: number | null
  geography: number | null
  geography_assigned: number | null
  created_at: string
  updated_at: string
}

export interface ScoreCreate {
  student_id: string
  exam_id: string
  chinese?: number
  math?: number
  english?: number
  physics?: number
  history?: number
  chemistry?: number
  chemistry_assigned?: number
  biology?: number
  biology_assigned?: number
  politics?: number
  politics_assigned?: number
  geography?: number
  geography_assigned?: number
}

export interface ScoreUpdate {
  chinese?: number
  math?: number
  english?: number
  physics?: number
  history?: number
  chemistry?: number
  chemistry_assigned?: number
  biology?: number
  biology_assigned?: number
  politics?: number
  politics_assigned?: number
  geography?: number
  geography_assigned?: number
}

export interface SchoolAdminDetailResponse {
  id: string
  user_id: string
  school_id: string
  school_name: string
  user_email: string
  user_nickname: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SchoolAdminCreate {
  email: string
  password: string
  nickname?: string
  school_id: string
}

export interface SchoolAdminUpdate {
  nickname?: string
  school_id?: string
  is_active?: boolean
}

export interface ClassStats {
  class_id: string
  class_name: string
  exam_id: string
  exam_name: string
  subject: string
  avg_score: number | null
  max_score: number | null
  min_score: number | null
  student_count: number
}

export interface SubjectStats {
  exam_id: string
  exam_name: string
  subject: string
  avg_score: number | null
  max_score: number | null
  min_score: number | null
  student_count: number
  max_score_student: string | null
  min_score_student: string | null
}

export interface StudentScoreTrend {
  student_id: string
  student_name: string
  exam_name: string
  exam_date: string
  total_score: number | null
  chinese: number | null
  math: number | null
  english: number | null
}

export interface OperationLogResponse {
  id: string
  user_id: string
  user_type: string
  action: string
  resource_type: string
  resource_id: string | null
  detail: string | null
  ip_address: string | null
  created_at: string
}

export interface PaginatedStudentsResponse {
  items: StudentResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PaginatedScoresResponse {
  items: ScoreResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface StudentQueryParams {
  page?: number
  page_size?: number
  class_id?: string
  name?: string
}

export interface ScoreQueryParams {
  page?: number
  page_size?: number
  exam_id?: string
  student_id?: string
}

export const getSchools = () => {
  return apiClient.get<SchoolResponse[]>('/school/')
}

export const getSchool = (schoolId: string) => {
  return apiClient.get<SchoolResponse>(`/school/${schoolId}`)
}

export const createSchool = (data: SchoolCreate) => {
  return apiClient.post<SchoolResponse>('/school/', data)
}

export const updateSchool = (schoolId: string, data: SchoolUpdate) => {
  return apiClient.put<SchoolResponse>(`/school/${schoolId}`, data)
}

export const deleteSchool = (schoolId: string) => {
  return apiClient.delete(`/school/${schoolId}`)
}

export const getSchoolClasses = (schoolId: string) => {
  return apiClient.get<ClassResponse[]>(`/school/${schoolId}/classes`)
}

export const getSchoolExams = (schoolId: string) => {
  return apiClient.get<ExamResponse[]>(`/school/${schoolId}/exams`)
}

export const getClasses = () => {
  return apiClient.get<ClassResponse[]>('/school/class/')
}

export const getClass = (classId: string) => {
  return apiClient.get<ClassResponse>(`/school/class/${classId}`)
}

export const createClass = (data: ClassCreate) => {
  return apiClient.post<ClassResponse>('/school/class/', data)
}

export const updateClass = (classId: string, data: ClassUpdate) => {
  return apiClient.put<ClassResponse>(`/school/class/${classId}`, data)
}

export const deleteClass = (classId: string) => {
  return apiClient.delete(`/school/class/${classId}`)
}

export const createClassBatch = (data: ClassBatchCreate) => {
  return apiClient.post<BatchImportResult>('/school/class/batch', data)
}

export const getClassStudents = (classId: string) => {
  return apiClient.get<StudentResponse[]>(`/school/class/${classId}/students`)
}

export const getStudents = (params?: StudentQueryParams) => {
  const queryParams = new URLSearchParams()
  if (params?.page) {
    queryParams.append('page', params.page.toString())
  }
  if (params?.page_size) {
    queryParams.append('page_size', params.page_size.toString())
  }
  if (params?.class_id) {
    queryParams.append('class_id', params.class_id)
  }
  if (params?.name) {
    queryParams.append('name', params.name)
  }
  const queryString = queryParams.toString()
  const url = queryString ? `/school/student/?${queryString}` : '/school/student/'
  return apiClient.get<PaginatedStudentsResponse>(url)
}

export const getStudent = (studentId: string) => {
  return apiClient.get<StudentResponse>(`/school/student/${studentId}`)
}

export const createStudent = (data: StudentCreate) => {
  return apiClient.post<StudentResponse>('/school/student/', data)
}

export const updateStudent = (studentId: string, data: StudentUpdate) => {
  return apiClient.put<StudentResponse>(`/school/student/${studentId}`, data)
}

export const deleteStudent = (studentId: string) => {
  return apiClient.delete(`/school/student/${studentId}`)
}

export const createStudentBatch = (data: StudentBatchCreate) => {
  return apiClient.post<BatchImportResult>('/school/student/batch', data)
}

export const getStudentScores = (studentId: string) => {
  return apiClient.get<ScoreResponse[]>(`/school/student/${studentId}/scores`)
}

export const getExams = () => {
  return apiClient.get<ExamResponse[]>('/school/exam/')
}

export const getExam = (examId: string) => {
  return apiClient.get<ExamResponse>(`/school/exam/${examId}`)
}

export const createExam = (data: ExamCreate) => {
  return apiClient.post<ExamResponse>('/school/exam/', data)
}

export const updateExam = (examId: string, data: ExamUpdate) => {
  return apiClient.put<ExamResponse>(`/school/exam/${examId}`, data)
}

export const deleteExam = (examId: string) => {
  return apiClient.delete(`/school/exam/${examId}`)
}

export const getExamScores = (examId: string) => {
  return apiClient.get<ScoreResponse[]>(`/school/exam/${examId}/scores`)
}

export const getScores = (params?: ScoreQueryParams) => {
  const queryParams = new URLSearchParams()
  if (params?.page) {
    queryParams.append('page', params.page.toString())
  }
  if (params?.page_size) {
    queryParams.append('page_size', params.page_size.toString())
  }
  if (params?.exam_id) {
    queryParams.append('exam_id', params.exam_id)
  }
  if (params?.student_id) {
    queryParams.append('student_id', params.student_id)
  }
  const queryString = queryParams.toString()
  const url = queryString ? `/school/score/?${queryString}` : '/school/score/'
  return apiClient.get<PaginatedScoresResponse>(url)
}

export const getScore = (scoreId: string) => {
  return apiClient.get<ScoreResponse>(`/school/score/${scoreId}`)
}

export const createScore = (data: ScoreCreate) => {
  return apiClient.post<ScoreResponse>('/school/score/', data)
}

export const createScoreBatch = (data: ScoreCreate[]) => {
  return apiClient.post<ScoreResponse[]>('/school/score/batch', data)
}

export const updateScore = (scoreId: string, data: ScoreUpdate) => {
  return apiClient.put<ScoreResponse>(`/school/score/${scoreId}`, data)
}

export const deleteScore = (scoreId: string) => {
  return apiClient.delete(`/school/score/${scoreId}`)
}

export const getSchoolAdmins = () => {
  return apiClient.get<SchoolAdminDetailResponse[]>('/school/admin/')
}

export const getSchoolAdmin = (adminId: string) => {
  return apiClient.get<SchoolAdminDetailResponse>(`/school/admin/${adminId}`)
}

export const createSchoolAdmin = (data: SchoolAdminCreate) => {
  return apiClient.post<SchoolAdminDetailResponse>('/school/admin/', data)
}

export const updateSchoolAdmin = (adminId: string, data: SchoolAdminUpdate) => {
  return apiClient.put<SchoolAdminDetailResponse>(`/school/admin/${adminId}`, data)
}

export const deleteSchoolAdmin = (adminId: string) => {
  return apiClient.delete(`/school/admin/${adminId}`)
}

export const toggleSchoolAdmin = (adminId: string) => {
  return apiClient.put<SchoolAdminDetailResponse>(`/school/admin/${adminId}/toggle`)
}

export const getClassStats = (classId: string, examId: string) => {
  return apiClient.get<ClassStats[]>(`/school/stats/class/${classId}/exam/${examId}`)
}

export const getSubjectStats = (examId: string, subject: string) => {
  return apiClient.get<SubjectStats>(`/school/stats/exam/${examId}/subject/${subject}`)
}

export const getStudentTrend = (studentId: string) => {
  return apiClient.get<StudentScoreTrend[]>(`/school/stats/student/${studentId}`)
}

export interface OperationLogParams {
  page?: number
  page_size?: number
  user_id?: string
  action?: string
  resource_type?: string
}

export interface PaginatedOperationLogs {
  items: OperationLogResponse[]
  total: number
  page: number
  page_size: number
}

export const getOperationLogs = (params?: OperationLogParams) => {
  const queryParams = new URLSearchParams()
  if (params?.page) {
    queryParams.append('page', params.page.toString())
  }
  if (params?.page_size) {
    queryParams.append('page_size', params.page_size.toString())
  }
  if (params?.user_id) {
    queryParams.append('user_id', params.user_id)
  }
  if (params?.action) {
    queryParams.append('action', params.action)
  }
  if (params?.resource_type) {
    queryParams.append('resource_type', params.resource_type)
  }
  const queryString = queryParams.toString()
  const url = queryString ? `/school/log/?${queryString}` : '/school/log/'
  return apiClient.get<PaginatedOperationLogs>(url)
}

export const getUserLogs = (userId: string) => {
  return apiClient.get<OperationLogResponse[]>(`/school/log/user/${userId}`)
}
