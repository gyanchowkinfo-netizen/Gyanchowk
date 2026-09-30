export interface UnifiedReview {
  _id?: string;
  studentName: string;
  studentAvatar?: string;
  roleOrExam: string;
  targetExam?: string;
  rating: number;
  comment: string;
  reviewText?: string;
  date?: string;
  approved?: boolean;
  featured?: boolean;
}

export const SHARED_STUDENT_REVIEWS: UnifiedReview[] = [
  {
    _id: 'shared-1',
    studentName: 'Aditya Varma',
    studentAvatar: '',
    roleOrExam: 'NEET 2026',
    targetExam: 'NEET 2026',
    rating: 5.0,
    comment: 'Concepts are taught with absolute clarity and practical examples. The structured lecture notes and high-yield questions helped me improve dramatically.',
    reviewText: 'Concepts are taught with absolute clarity and practical examples. The structured lecture notes and high-yield questions helped me improve dramatically.',
    date: '25 Sep 2026',
    approved: true,
  },
  {
    _id: 'shared-2',
    studentName: 'Priya Sharma',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    roleOrExam: 'NEET Aspirant',
    targetExam: 'NEET Aspirant',
    rating: 5.0,
    comment: 'The way organic chemistry is explained is just next level. It is simple, logical and very effective for national competitive exams.',
    reviewText: 'The way organic chemistry is explained is just next level. It is simple, logical and very effective for national competitive exams.',
    date: '5 Aug 2025',
    approved: true,
  },
  {
    _id: 'shared-3',
    studentName: 'Amit Kumar',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    roleOrExam: 'UPSC Aspirant',
    targetExam: 'UPSC Aspirant',
    rating: 5.0,
    comment: 'The structured methodology and lecture notes make even complex topics simple to master. Concepts are clear and easy to understand. Highly recommended!',
    reviewText: 'The structured methodology and lecture notes make even complex topics simple to master. Concepts are clear and easy to understand. Highly recommended!',
    date: '12 Aug 2025',
    approved: true,
  },
  {
    _id: 'shared-4',
    studentName: 'Rahul Singh',
    studentAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    roleOrExam: 'JEE Aspirant',
    targetExam: 'JEE Aspirant',
    rating: 5.0,
    comment: 'Best teacher for Chemistry. His notes and practice problem sets are very helpful. I have improved a lot under his guidance.',
    reviewText: 'Best teacher for Chemistry. His notes and practice problem sets are very helpful. I have improved a lot under his guidance.',
    date: '28 Jul 2025',
    approved: true,
  },
  {
    _id: 'shared-5',
    studentName: 'Sneha Patel',
    studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    roleOrExam: 'Board Exam Student',
    targetExam: 'Board Exam Student',
    rating: 5.0,
    comment: 'Clarified all my basic chemical reaction doubts in just a few lectures. Truly transformed my preparation and boosted my test scores!',
    reviewText: 'Clarified all my basic chemical reaction doubts in just a few lectures. Truly transformed my preparation and boosted my test scores!',
    date: '15 Jul 2025',
    approved: true,
  },
  {
    _id: 'shared-6',
    studentName: 'Ananya Sen',
    studentAvatar: '',
    roleOrExam: 'Competitive Exams',
    targetExam: 'Competitive Exams',
    rating: 5.0,
    comment: 'Ranked test series and doubt clearing sessions are incredible. Gyan Chowk gives the quietest, most focused learning environment.',
    reviewText: 'Ranked test series and doubt clearing sessions are incredible. Gyan Chowk gives the quietest, most focused learning environment.',
    date: '10 Jul 2025',
    approved: true,
  },
];
