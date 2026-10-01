export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

// Every UI string lives here as [English, Indonesian], side by side.
const M = {
  "brand.tag": ["Remember what you learn.", "Ingat apa yang kamu pelajari."],
  "nav.features": ["Features", "Fitur"], "nav.courses": ["Courses", "Mata kuliah"], "nav.about": ["About", "Tentang"],
  "nav.login": ["Log in", "Masuk"], "nav.register": ["Sign up", "Daftar"], "nav.dashboard": ["Dashboard", "Dasbor"],
  "nav.mycourses": ["My courses", "Mata kuliahku"], "nav.logout": ["Log out", "Keluar"], "nav.menu": ["Menu", "Menu"],
  "hero.sub": ["memento.edu keeps every session, material and deadline of your courses in one calm place.", "memento.edu menyimpan setiap sesi, materi, dan tenggat kuliahmu di satu tempat yang tenang."],
  "hero.cta": ["Create free account", "Buat akun gratis"], "hero.demo": ["Try the demo account", "Coba akun demo"],
  "about.title": ["One calm place for the whole semester", "Satu tempat yang tenang untuk satu semester"],
  "about.body": ["memento.edu is a learning management system for students and lecturers. Sessions, materials, assignments and schedules live together, so nothing you need to remember goes missing.", "memento.edu adalah sistem manajemen pembelajaran untuk mahasiswa dan dosen. Sesi, materi, tugas, dan jadwal berada bersama, sehingga tidak ada yang perlu kamu ingat terlewat."],
  "courses.title": ["Courses this semester", "Mata kuliah semester ini"],
  "courses.sub": ["Sign up to enroll and track your progress.", "Daftar untuk mengikuti dan memantau progresmu."],
  "courses.sessions": ["{n} sessions", "{n} sesi"], "courses.credits": ["{n} credits", "{n} SKS"],
  "features.title": ["Everything a course needs", "Semua yang dibutuhkan sebuah mata kuliah"],
  "f.sessions.t": ["Session by session", "Sesi demi sesi"], "f.sessions.d": ["Every class has its own summary, date and materials.", "Setiap pertemuan punya ringkasan, tanggal, dan materinya sendiri."],
  "f.materials.t": ["Materials in one place", "Materi di satu tempat"], "f.materials.d": ["Slides, readings, videos and links, ready to open and tick off.", "Slide, bacaan, video, dan tautan, siap dibuka dan ditandai selesai."],
  "f.assign.t": ["Assignments", "Tugas"], "f.assign.d": ["See what is due, submit your work and check your grade.", "Lihat tenggat, kumpulkan tugas, dan cek nilaimu."],
  "f.schedule.t": ["Weekly schedule", "Jadwal mingguan"], "f.schedule.d": ["Lectures and practicums for the days ahead.", "Kuliah dan praktikum untuk hari-hari ke depan."],
  "f.progress.t": ["Progress you can see", "Progres yang terlihat"], "f.progress.d": ["A quiet progress bar for each course, updated as you go.", "Bilah progres yang tenang untuk tiap mata kuliah, diperbarui saat kamu belajar."],
  "f.notify.t": ["Gentle reminders", "Pengingat yang lembut"], "f.notify.d": ["Deadlines and announcements, without the noise.", "Tenggat dan pengumuman, tanpa gangguan."],
  "foot.product": ["Explore", "Jelajahi"], "foot.account": ["Account", "Akun"],
  "foot.rights": ["© {y} memento.edu. Built as a learning project.", "© {y} memento.edu. Dibuat sebagai proyek pembelajaran."],
  "field.email": ["Email", "Email"], "field.password": ["Password", "Kata sandi"], "field.name": ["Full name", "Nama lengkap"], "field.confirm": ["Confirm password", "Konfirmasi kata sandi"],
  "login.title": ["Welcome back", "Selamat datang kembali"], "login.sub": ["Log in to continue learning.", "Masuk untuk melanjutkan belajar."],
  "login.submit": ["Log in", "Masuk"], "login.forgot": ["Forgot password?", "Lupa kata sandi?"],
  "login.noacc": ["New to memento.edu?", "Baru di memento.edu?"], "login.demo": ["Demo account: {email} / {pw}", "Akun demo: {email} / {pw}"],
  "register.title": ["Create your account", "Buat akunmu"], "register.sub": ["Join your courses in a minute.", "Bergabung ke mata kuliahmu dalam semenit."],
  "register.submit": ["Create account", "Buat akun"], "register.have": ["Already have an account?", "Sudah punya akun?"],
  "forgot.title": ["Reset your password", "Atur ulang kata sandi"], "forgot.sub": ["Enter your email and we'll create a reset link.", "Masukkan emailmu dan kami buatkan tautan reset."],
  "forgot.submit": ["Create reset link", "Buat tautan reset"], "forgot.demo": ["Demo mode: no email is sent, so the link appears here.", "Mode demo: email tidak dikirim, jadi tautan muncul di sini."],
  "forgot.sent": ["If that email is registered, a reset link is ready.", "Jika email terdaftar, tautan reset sudah siap."],
  "forgot.open": ["Open reset link", "Buka tautan reset"], "forgot.back": ["Back to log in", "Kembali ke halaman masuk"],
  "reset.title": ["Choose a new password", "Pilih kata sandi baru"], "reset.submit": ["Save new password", "Simpan kata sandi baru"],
  "reset.done": ["Password updated. Log in with your new password.", "Kata sandi diperbarui. Masuk dengan kata sandi barumu."],
  "err.invalid": ["Email or password is incorrect.", "Email atau kata sandi salah."],
  "err.exists": ["That email is already registered. Try logging in.", "Email itu sudah terdaftar. Coba masuk."],
  "err.short": ["Use at least 8 characters for your password.", "Gunakan minimal 8 karakter untuk kata sandi."],
  "err.mismatch": ["The two passwords don't match.", "Kedua kata sandi tidak sama."],
  "err.fields": ["Fill in every field.", "Isi semua kolom."],
  "err.token": ["This reset link is invalid or has expired.", "Tautan reset ini tidak valid atau sudah kedaluwarsa."],
  "greet.morning": ["Good morning, {name}", "Selamat pagi, {name}"], "greet.afternoon": ["Good afternoon, {name}", "Selamat siang, {name}"], "greet.evening": ["Good evening, {name}", "Selamat malam, {name}"],
  "dash.sub": ["Here is where you left off.", "Ini kelanjutan belajarmu."],
  "dash.continue": ["Continue learning", "Lanjutkan belajar"], "dash.open": ["Open session", "Buka sesi"],
  "dash.alldone": ["You've finished every session. Well done.", "Semua sesi sudah selesai. Kerja bagus."],
  "dash.courses": ["Your courses", "Mata kuliahmu"], "dash.assign": ["Assignments", "Tugas"], "dash.schedule": ["Next 7 days", "7 hari ke depan"], "dash.notif": ["Notifications", "Notifikasi"],
  "dash.markread": ["Mark all as read", "Tandai semua dibaca"],
  "dash.noassign": ["Nothing due. Enjoy the quiet.", "Tidak ada tenggat. Nikmati waktu tenangmu."],
  "dash.nosched": ["No classes in the next 7 days.", "Tidak ada kelas dalam 7 hari ke depan."], "dash.nonotif": ["You're all caught up.", "Tidak ada notifikasi baru."],
  "dash.nocourses": ["You're not enrolled in any course yet.", "Kamu belum terdaftar di mata kuliah mana pun."],
  "progress": ["{n}% complete", "{n}% selesai"], "due": ["Due {date}", "Tenggat {date}"],
  "status.submitted": ["Submitted", "Terkumpul"], "status.graded": ["Graded: {g}", "Nilai: {g}"], "status.overdue": ["Overdue", "Terlambat"], "status.pending": ["To do", "Belum dikerjakan"],
  "tab.sessions": ["Sessions", "Sesi"], "tab.materials": ["Materials", "Materi"], "tab.assignments": ["Assignments", "Tugas"], "tab.practicum": ["Practicum", "Praktikum"],
  "session.label": ["Session {n}", "Sesi {n}"], "session.done": ["Done", "Selesai"], "session.current": ["Up next", "Berikutnya"], "session.upcoming": ["Upcoming", "Akan datang"],
  "session.markdone": ["Mark session as done", "Tandai sesi selesai"], "session.undo": ["Mark as not done", "Batalkan tanda selesai"],
  "mat.toggle": ["Toggle done", "Ubah status selesai"], "mat.open": ["Open", "Buka"], "mat.empty": ["No materials yet.", "Belum ada materi."],
  "kind.pdf": ["Reading", "Bacaan"], "kind.slide": ["Slides", "Slide"], "kind.video": ["Video", "Video"], "kind.link": ["Link", "Tautan"],
  "assign.submit": ["Submit work", "Kumpulkan tugas"], "assign.update": ["Update submission", "Perbarui pengumpulan"],
  "assign.placeholder": ["Write your answer or paste a link to your work", "Tulis jawabanmu atau tempel tautan ke pekerjaanmu"],
  "assign.yours": ["Your submission", "Pengumpulanmu"], "prac.task": ["Lab task {n}", "Tugas praktikum {n}"],
  "back": ["All courses", "Semua mata kuliah"], "course.lecturer": ["Lecturer: {name}", "Dosen: {name}"],
  "mycourses.sub": ["Pick up any course where you left off.", "Lanjutkan mata kuliah mana pun dari terakhir kamu berhenti."],
  "hero.step1": ["Read the session summary", "Baca ringkasan sesi"], "hero.step2": ["Open the slides", "Buka slide"], "hero.step3": ["Finish the reading", "Selesaikan bacaan"],
  "hero.step4": ["Submit the assignment", "Kumpulkan tugas"], "hero.step5": ["Mark the session as done", "Tandai sesi selesai"],
  "empty.sessions": ["Your lecturer hasn't published any sessions yet.", "Dosen belum menerbitkan sesi apa pun."],
  "empty.assign": ["No assignments for this course yet.", "Belum ada tugas untuk mata kuliah ini."],
  "empty.prac": ["No practicum tasks for this course.", "Tidak ada tugas praktikum untuk mata kuliah ini."],
  "dash.nosessions": ["No sessions have been published yet. They will appear here.", "Belum ada sesi yang diterbitkan. Sesi akan muncul di sini."],
  "lang.switch": ["Bahasa Indonesia", "English"],
} as const satisfies Record<string, readonly [string, string]>;

export type Key = keyof typeof M;
export function getT(locale: Locale) {
  const i = locale === "id" ? 1 : 0;
  return (key: Key, vars: Record<string, string | number> = {}) =>
    M[key][i].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
export const pick = (row: Record<string, any>, field: string, locale: Locale): string => row[`${field}_${locale}`];
export function fmt(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", { timeZone: "Asia/Jakarta", ...opts }).format(new Date(iso));
}
