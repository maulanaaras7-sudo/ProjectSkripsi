export interface UserRow extends Record<string, unknown> {
  id: number;
  nama: string;
  email: string;
  password: string;
  role: "guru" | "siswa";
  kelompok: "rendah" | "sedang" | "tinggi" | null;
  pretest_selesai: number;
  posttest_selesai: number;
}

export interface QuestionRow extends Record<string, unknown> {
  id: number;
  jenis: "pretest" | "latihan" | "posttest";
  tingkat_kesulitan: "rendah" | "sedang" | "tinggi";
  sub_materi: string | null;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  pilihan_e: string | null;
  jawaban_benar: "a" | "b" | "c" | "d" | "e";
  pembahasan: string | null;
  _option_order?: Array<"a" | "b" | "c" | "d" | "e">;
}

export interface MaterialRow extends Record<string, unknown> {
  id: number;
  judul: string;
  urutan: number;
  konten: string;
}
