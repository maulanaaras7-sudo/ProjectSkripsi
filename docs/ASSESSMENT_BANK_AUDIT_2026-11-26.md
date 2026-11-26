# Audit baseline bank pretest dan posttest Fungsiverse

> Snapshot read-only sebelum perubahan teknis. Tanggal audit: 26 November 2026. Tidak ada isi soal, kunci, ID, jawaban siswa, atau nilai yang diubah pada fase ini.

## Ringkasan

- Inventaris: 100 PRE dan 100 POST.
- Total kesulitan per bank: 34 rendah, 33 sedang, 33 tinggi.
- Integritas teknis: 200/200 butir memiliki metadata inti, lima opsi, kunci valid, dan nilai expected yang konsisten.
- Sel kuota nol: 14 butir perlu review akademik (POST-F-013, POST-F-014, POST-F-015, POST-F-016, POST-F-092, POST-F-093, POST-F-094, PRE-F-013, PRE-F-014, PRE-F-015, PRE-F-016, PRE-F-092, PRE-F-093, PRE-F-094).
- Pemetaan SM02 ke TP: 18 butir masih memakai TP01, sedangkan blueprint menyebut prasyarat TP02–TP03.
- Kesulitan tinggi berlevel C2: 10 butir perlu penilaian ahli; tingkat kesulitan tidak diubah otomatis.
- Kesetaraan PRE/POST: 96 pasangan identik setelah label awal/akhir dinormalisasi; 4 pasangan hanya berbeda pada sebagian teks. Seluruh pasangan memerlukan review independensi bank.
- Skema runtime `soal` belum memiliki kolom indikator, status versi, dan versi butir yang eksplisit; `kode_ipk`, `aktif`, dan `metadata_verifikasi` hanya memenuhi sebagian kebutuhan metadata blueprint.

## Matriks stok aktual dibanding target per bank

Format sel: `aktual/target`.

| Bank | Submateri | Rendah | Sedang | Tinggi | Total aktual | Total target |
|---|---|---:|---:|---:|---:|---:|
| PRE | SM01 | 3/5 | 3/4 | 3/4 | 9 | 13 |
| PRE | SM02 | 3/5 | 3/4 | 3/4 | 9 | 13 |
| PRE | SM03 | 4/4 | 3/4 | 3/0 | 10 | 8 |
| PRE | SM04 | 3/4 | 3/4 | 3/4 | 9 | 12 |
| PRE | SM05 | 2/4 | 2/4 | 2/4 | 6 | 12 |
| PRE | SM06 | 4/4 | 4/4 | 4/4 | 12 | 12 |
| PRE | SM07 | 3/4 | 3/3 | 3/4 | 9 | 11 |
| PRE | SM08 | 8/4 | 8/3 | 8/5 | 24 | 12 |
| PRE | SM09 | 4/0 | 4/3 | 4/4 | 12 | 7 |
| POST | SM01 | 3/5 | 3/4 | 3/4 | 9 | 13 |
| POST | SM02 | 3/5 | 3/4 | 3/4 | 9 | 13 |
| POST | SM03 | 4/4 | 3/4 | 3/0 | 10 | 8 |
| POST | SM04 | 3/4 | 3/4 | 3/4 | 9 | 12 |
| POST | SM05 | 2/4 | 2/4 | 2/4 | 6 | 12 |
| POST | SM06 | 4/4 | 4/4 | 4/4 | 12 | 12 |
| POST | SM07 | 3/4 | 3/3 | 3/4 | 9 | 11 |
| POST | SM08 | 8/4 | 8/3 | 8/5 | 24 | 12 |
| POST | SM09 | 4/0 | 4/3 | 4/4 | 12 | 7 |

Tidak ada shortage untuk 25 slot paket karena setiap sel dengan kuota 1 memiliki stok. Namun distribusi inventaris per SM tidak mengikuti target 100 butir; perubahan label atau isi memerlukan persetujuan akademik.

## Inventaris 200 butir

Flag `PARALLEL_BANK_REVIEW` adalah temuan lintas-bank, bukan bukti bahwa kunci salah. `ZERO_QUOTA_CELL_REVIEW`, `SM02_TP_REVIEW`, dan `HIGH_C2_DIFFICULTY_REVIEW` tidak boleh diperbaiki otomatis.

| DB ID | Item ID | Bank | SM | Kesulitan | TP | IPK | Kognitif | Template | Flag review |
|---:|---|---|---|---|---|---|---|---|---|
| 797 | POST-F-001 | POST | SM08 | rendah | TP04 | IPK4.1 | C2 | inverse_graph_concept | PARALLEL_BANK_REVIEW |
| 798 | POST-F-002 | POST | SM08 | rendah | TP04 | IPK4.1 | C2 | inverse_graph_concept | PARALLEL_BANK_REVIEW |
| 799 | POST-F-003 | POST | SM08 | rendah | TP04 | IPK4.1 | C2 | inverse_graph_concept | PARALLEL_BANK_REVIEW |
| 800 | POST-F-004 | POST | SM08 | rendah | TP04 | IPK4.1 | C2 | inverse_graph_concept | PARALLEL_BANK_REVIEW |
| 801 | POST-F-005 | POST | SM08 | rendah | TP05 | IPK5.1 | C2 | inverse_composition_concept | PARALLEL_BANK_REVIEW |
| 802 | POST-F-006 | POST | SM08 | rendah | TP05 | IPK5.1 | C2 | inverse_composition_concept | PARALLEL_BANK_REVIEW |
| 803 | POST-F-007 | POST | SM08 | rendah | TP05 | IPK5.1 | C2 | inverse_composition_concept | PARALLEL_BANK_REVIEW |
| 804 | POST-F-008 | POST | SM08 | rendah | TP05 | IPK5.1 | C2 | inverse_composition_concept | PARALLEL_BANK_REVIEW |
| 805 | POST-F-009 | POST | SM06 | rendah | TP03 | IPK3.2 | C2 | inverse_condition | PARALLEL_BANK_REVIEW |
| 806 | POST-F-010 | POST | SM06 | rendah | TP03 | IPK3.1 | C2 | inverse_bijective_classification | PARALLEL_BANK_REVIEW |
| 807 | POST-F-011 | POST | SM06 | rendah | TP03 | IPK3.2 | C2 | inverse_condition | PARALLEL_BANK_REVIEW |
| 808 | POST-F-012 | POST | SM06 | rendah | TP03 | IPK3.1 | C2 | inverse_bijective_classification | PARALLEL_BANK_REVIEW |
| 809 | POST-F-013 | POST | SM09 | rendah | TP06 | IPK6.1 | C3 | context_composition | ZERO_QUOTA_CELL_REVIEW, PARALLEL_BANK_REVIEW |
| 810 | POST-F-014 | POST | SM09 | rendah | TP06 | IPK6.1 | C3 | context_composition | ZERO_QUOTA_CELL_REVIEW, PARALLEL_BANK_REVIEW |
| 811 | POST-F-015 | POST | SM09 | rendah | TP06 | IPK6.1 | C3 | context_composition | ZERO_QUOTA_CELL_REVIEW, PARALLEL_BANK_REVIEW |
| 900 | POST-F-016 | POST | SM09 | rendah | TP06 | IPK6.1 | C3 | context_composition | ZERO_QUOTA_CELL_REVIEW, PARALLEL_BANK_REVIEW |
| 901 | POST-F-017 | POST | SM01 | rendah | TP01 | IPK1.3 | C3 | fungsi_value | PARALLEL_BANK_REVIEW |
| 902 | POST-F-018 | POST | SM02 | rendah | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 903 | POST-F-019 | POST | SM01 | rendah | TP01 | IPK1.2 | C2 | fungsi_range | PARALLEL_BANK_REVIEW |
| 904 | POST-F-020 | POST | SM02 | rendah | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 905 | POST-F-021 | POST | SM01 | rendah | TP01 | IPK1.1 | C2 | fungsi_definition | PARALLEL_BANK_REVIEW |
| 906 | POST-F-022 | POST | SM04 | rendah | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 907 | POST-F-023 | POST | SM04 | rendah | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 908 | POST-F-024 | POST | SM04 | rendah | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 909 | POST-F-025 | POST | SM03 | rendah | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 910 | POST-F-026 | POST | SM03 | rendah | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 911 | POST-F-027 | POST | SM03 | rendah | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 912 | POST-F-028 | POST | SM03 | rendah | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 913 | POST-F-029 | POST | SM07 | rendah | TP03 | IPK3.3 | C3 | inverse_linear_formula_aligned | PARALLEL_BANK_REVIEW |
| 914 | POST-F-030 | POST | SM07 | rendah | TP03 | IPK3.3 | C3 | inverse_linear_formula_aligned | PARALLEL_BANK_REVIEW |
| 915 | POST-F-031 | POST | SM07 | rendah | TP03 | IPK3.3 | C3 | inverse_linear_formula_aligned | PARALLEL_BANK_REVIEW |
| 916 | POST-F-032 | POST | SM02 | rendah | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 917 | POST-F-033 | POST | SM05 | rendah | TP02 | IPK2.4 | C2 | composition_noncommutative | PARALLEL_BANK_REVIEW |
| 918 | POST-F-034 | POST | SM05 | rendah | TP02 | IPK2.4 | C2 | composition_noncommutative | PARALLEL_BANK_REVIEW |
| 919 | POST-F-035 | POST | SM08 | sedang | TP04 | IPK4.2 | C3 | inverse_graph_point | PARALLEL_BANK_REVIEW |
| 920 | POST-F-036 | POST | SM08 | sedang | TP04 | IPK4.2 | C3 | inverse_graph_point | PARALLEL_BANK_REVIEW |
| 921 | POST-F-037 | POST | SM08 | sedang | TP04 | IPK4.2 | C3 | inverse_graph_point | PARALLEL_BANK_REVIEW |
| 922 | POST-F-038 | POST | SM08 | sedang | TP04 | IPK4.2 | C3 | inverse_graph_point | PARALLEL_BANK_REVIEW |
| 923 | POST-F-039 | POST | SM08 | sedang | TP05 | IPK5.2 | C3 | inverse_composition_value | PARALLEL_BANK_REVIEW |
| 924 | POST-F-040 | POST | SM08 | sedang | TP05 | IPK5.2 | C3 | inverse_composition_value | PARALLEL_BANK_REVIEW |
| 925 | POST-F-041 | POST | SM08 | sedang | TP05 | IPK5.2 | C3 | inverse_composition_value | PARALLEL_BANK_REVIEW |
| 926 | POST-F-042 | POST | SM08 | sedang | TP05 | IPK5.2 | C3 | inverse_composition_value | PARALLEL_BANK_REVIEW |
| 927 | POST-F-043 | POST | SM06 | sedang | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 928 | POST-F-044 | POST | SM06 | sedang | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 929 | POST-F-045 | POST | SM06 | sedang | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 930 | POST-F-046 | POST | SM06 | sedang | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 931 | POST-F-047 | POST | SM09 | sedang | TP06 | IPK6.2 | C3 | context_inverse | PARALLEL_BANK_REVIEW |
| 932 | POST-F-048 | POST | SM09 | sedang | TP06 | IPK6.2 | C3 | context_inverse | PARALLEL_BANK_REVIEW |
| 933 | POST-F-049 | POST | SM09 | sedang | TP06 | IPK6.2 | C3 | context_inverse | PARALLEL_BANK_REVIEW |
| 934 | POST-F-050 | POST | SM09 | sedang | TP06 | IPK6.2 | C3 | context_inverse | PARALLEL_BANK_REVIEW |
| 935 | POST-F-051 | POST | SM01 | sedang | TP01 | IPK1.1 | C2 | fungsi_definition | PARALLEL_BANK_REVIEW |
| 936 | POST-F-052 | POST | SM02 | sedang | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 937 | POST-F-053 | POST | SM01 | sedang | TP01 | IPK1.3 | C3 | fungsi_value | PARALLEL_BANK_REVIEW |
| 938 | POST-F-054 | POST | SM02 | sedang | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 939 | POST-F-055 | POST | SM01 | sedang | TP01 | IPK1.2 | C2 | fungsi_range | PARALLEL_BANK_REVIEW |
| 940 | POST-F-056 | POST | SM04 | sedang | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 941 | POST-F-057 | POST | SM04 | sedang | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 942 | POST-F-058 | POST | SM04 | sedang | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 943 | POST-F-059 | POST | SM03 | sedang | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 944 | POST-F-060 | POST | SM03 | sedang | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 945 | POST-F-061 | POST | SM03 | sedang | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 946 | POST-F-062 | POST | SM07 | sedang | TP03 | IPK3.3 | C3 | inverse_quadratic_value_aligned | PARALLEL_BANK_REVIEW |
| 947 | POST-F-063 | POST | SM07 | sedang | TP03 | IPK3.3 | C3 | inverse_quadratic_value_aligned | PARALLEL_BANK_REVIEW |
| 948 | POST-F-064 | POST | SM07 | sedang | TP03 | IPK3.3 | C3 | inverse_quadratic_value_aligned | PARALLEL_BANK_REVIEW |
| 949 | POST-F-065 | POST | SM02 | sedang | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 950 | POST-F-066 | POST | SM05 | sedang | TP02 | IPK2.5 | C4 | composition_property_analysis | PARALLEL_BANK_REVIEW |
| 951 | POST-F-067 | POST | SM05 | sedang | TP02 | IPK2.5 | C4 | composition_property_analysis | PARALLEL_BANK_REVIEW |
| 952 | POST-F-068 | POST | SM08 | tinggi | TP04 | IPK4.3 | C4 | inverse_graph_analysis | PARALLEL_BANK_REVIEW |
| 953 | POST-F-069 | POST | SM08 | tinggi | TP04 | IPK4.3 | C4 | inverse_graph_analysis | PARALLEL_BANK_REVIEW |
| 954 | POST-F-070 | POST | SM08 | tinggi | TP04 | IPK4.3 | C4 | inverse_graph_analysis | PARALLEL_BANK_REVIEW |
| 955 | POST-F-071 | POST | SM08 | tinggi | TP04 | IPK4.3 | C4 | inverse_graph_analysis | PARALLEL_BANK_REVIEW |
| 956 | POST-F-072 | POST | SM08 | tinggi | TP05 | IPK5.3 | C4 | inverse_composition_analysis | PARALLEL_BANK_REVIEW |
| 957 | POST-F-073 | POST | SM08 | tinggi | TP05 | IPK5.3 | C4 | inverse_composition_analysis | PARALLEL_BANK_REVIEW |
| 958 | POST-F-074 | POST | SM08 | tinggi | TP05 | IPK5.3 | C4 | inverse_composition_analysis | PARALLEL_BANK_REVIEW |
| 959 | POST-F-075 | POST | SM08 | tinggi | TP05 | IPK5.3 | C4 | inverse_composition_analysis | PARALLEL_BANK_REVIEW |
| 960 | POST-F-076 | POST | SM06 | tinggi | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 961 | POST-F-077 | POST | SM06 | tinggi | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 962 | POST-F-078 | POST | SM06 | tinggi | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 963 | POST-F-079 | POST | SM06 | tinggi | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 964 | POST-F-080 | POST | SM09 | tinggi | TP06 | IPK6.3 | C4 | context_analysis | PARALLEL_BANK_REVIEW |
| 965 | POST-F-081 | POST | SM09 | tinggi | TP06 | IPK6.3 | C4 | context_analysis | PARALLEL_BANK_REVIEW |
| 966 | POST-F-082 | POST | SM09 | tinggi | TP06 | IPK6.3 | C4 | context_analysis | PARALLEL_BANK_REVIEW |
| 967 | POST-F-083 | POST | SM09 | tinggi | TP06 | IPK6.3 | C4 | context_analysis | PARALLEL_BANK_REVIEW |
| 968 | POST-F-084 | POST | SM01 | tinggi | TP01 | IPK1.1 | C2 | fungsi_definition | HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 969 | POST-F-085 | POST | SM02 | tinggi | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 970 | POST-F-086 | POST | SM01 | tinggi | TP01 | IPK1.3 | C3 | fungsi_value | PARALLEL_BANK_REVIEW |
| 971 | POST-F-087 | POST | SM02 | tinggi | TP01 | IPK1.4 | C3 | fungsi_quotient | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 972 | POST-F-088 | POST | SM01 | tinggi | TP01 | IPK1.2 | C2 | fungsi_range | HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 973 | POST-F-089 | POST | SM04 | tinggi | TP02 | IPK2.3 | C3 | exponential_three_function_composition | PARALLEL_BANK_REVIEW |
| 974 | POST-F-090 | POST | SM04 | tinggi | TP02 | IPK2.3 | C3 | exponential_three_function_composition | PARALLEL_BANK_REVIEW |
| 975 | POST-F-091 | POST | SM04 | tinggi | TP02 | IPK2.3 | C3 | exponential_three_function_composition | PARALLEL_BANK_REVIEW |
| 976 | POST-F-092 | POST | SM03 | tinggi | TP02 | IPK2.1 | C2 | composition_notation_three | ZERO_QUOTA_CELL_REVIEW, HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 977 | POST-F-093 | POST | SM03 | tinggi | TP02 | IPK2.1 | C2 | composition_notation_three | ZERO_QUOTA_CELL_REVIEW, HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 978 | POST-F-094 | POST | SM03 | tinggi | TP02 | IPK2.1 | C2 | composition_notation_three | ZERO_QUOTA_CELL_REVIEW, HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 979 | POST-F-095 | POST | SM07 | tinggi | TP03 | IPK3.3 | C3 | inverse_fractional_formula_aligned | PARALLEL_BANK_REVIEW |
| 980 | POST-F-096 | POST | SM07 | tinggi | TP03 | IPK3.3 | C3 | inverse_fractional_formula_aligned | PARALLEL_BANK_REVIEW |
| 981 | POST-F-097 | POST | SM07 | tinggi | TP03 | IPK3.3 | C3 | inverse_fractional_formula_aligned | PARALLEL_BANK_REVIEW |
| 982 | POST-F-098 | POST | SM02 | tinggi | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 983 | POST-F-099 | POST | SM05 | tinggi | TP02 | IPK2.5 | C4 | composition_property_analysis | PARALLEL_BANK_REVIEW |
| 984 | POST-F-100 | POST | SM05 | tinggi | TP02 | IPK2.5 | C4 | composition_property_analysis | PARALLEL_BANK_REVIEW |
| 782 | PRE-F-001 | PRE | SM08 | rendah | TP04 | IPK4.1 | C2 | inverse_graph_concept | PARALLEL_BANK_REVIEW |
| 783 | PRE-F-002 | PRE | SM08 | rendah | TP04 | IPK4.1 | C2 | inverse_graph_concept | PARALLEL_BANK_REVIEW |
| 784 | PRE-F-003 | PRE | SM08 | rendah | TP04 | IPK4.1 | C2 | inverse_graph_concept | PARALLEL_BANK_REVIEW |
| 785 | PRE-F-004 | PRE | SM08 | rendah | TP04 | IPK4.1 | C2 | inverse_graph_concept | PARALLEL_BANK_REVIEW |
| 786 | PRE-F-005 | PRE | SM08 | rendah | TP05 | IPK5.1 | C2 | inverse_composition_concept | PARALLEL_BANK_REVIEW |
| 787 | PRE-F-006 | PRE | SM08 | rendah | TP05 | IPK5.1 | C2 | inverse_composition_concept | PARALLEL_BANK_REVIEW |
| 788 | PRE-F-007 | PRE | SM08 | rendah | TP05 | IPK5.1 | C2 | inverse_composition_concept | PARALLEL_BANK_REVIEW |
| 789 | PRE-F-008 | PRE | SM08 | rendah | TP05 | IPK5.1 | C2 | inverse_composition_concept | PARALLEL_BANK_REVIEW |
| 790 | PRE-F-009 | PRE | SM06 | rendah | TP03 | IPK3.2 | C2 | inverse_condition | PARALLEL_BANK_REVIEW |
| 791 | PRE-F-010 | PRE | SM06 | rendah | TP03 | IPK3.1 | C2 | inverse_bijective_classification | PARALLEL_BANK_REVIEW |
| 792 | PRE-F-011 | PRE | SM06 | rendah | TP03 | IPK3.2 | C2 | inverse_condition | PARALLEL_BANK_REVIEW |
| 793 | PRE-F-012 | PRE | SM06 | rendah | TP03 | IPK3.1 | C2 | inverse_bijective_classification | PARALLEL_BANK_REVIEW |
| 794 | PRE-F-013 | PRE | SM09 | rendah | TP06 | IPK6.1 | C3 | context_composition | ZERO_QUOTA_CELL_REVIEW, PARALLEL_BANK_REVIEW |
| 795 | PRE-F-014 | PRE | SM09 | rendah | TP06 | IPK6.1 | C3 | context_composition | ZERO_QUOTA_CELL_REVIEW, PARALLEL_BANK_REVIEW |
| 796 | PRE-F-015 | PRE | SM09 | rendah | TP06 | IPK6.1 | C3 | context_composition | ZERO_QUOTA_CELL_REVIEW, PARALLEL_BANK_REVIEW |
| 815 | PRE-F-016 | PRE | SM09 | rendah | TP06 | IPK6.1 | C3 | context_composition | ZERO_QUOTA_CELL_REVIEW, PARALLEL_BANK_REVIEW |
| 816 | PRE-F-017 | PRE | SM01 | rendah | TP01 | IPK1.3 | C3 | fungsi_value | PARALLEL_BANK_REVIEW |
| 817 | PRE-F-018 | PRE | SM02 | rendah | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 818 | PRE-F-019 | PRE | SM01 | rendah | TP01 | IPK1.2 | C2 | fungsi_range | PARALLEL_BANK_REVIEW |
| 819 | PRE-F-020 | PRE | SM02 | rendah | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 820 | PRE-F-021 | PRE | SM01 | rendah | TP01 | IPK1.1 | C2 | fungsi_definition | PARALLEL_BANK_REVIEW |
| 821 | PRE-F-022 | PRE | SM04 | rendah | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 822 | PRE-F-023 | PRE | SM04 | rendah | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 823 | PRE-F-024 | PRE | SM04 | rendah | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 824 | PRE-F-025 | PRE | SM03 | rendah | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 825 | PRE-F-026 | PRE | SM03 | rendah | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 826 | PRE-F-027 | PRE | SM03 | rendah | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 827 | PRE-F-028 | PRE | SM03 | rendah | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 828 | PRE-F-029 | PRE | SM07 | rendah | TP03 | IPK3.3 | C3 | inverse_linear_formula_aligned | PARALLEL_BANK_REVIEW |
| 829 | PRE-F-030 | PRE | SM07 | rendah | TP03 | IPK3.3 | C3 | inverse_linear_formula_aligned | PARALLEL_BANK_REVIEW |
| 830 | PRE-F-031 | PRE | SM07 | rendah | TP03 | IPK3.3 | C3 | inverse_linear_formula_aligned | PARALLEL_BANK_REVIEW |
| 831 | PRE-F-032 | PRE | SM02 | rendah | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 832 | PRE-F-033 | PRE | SM05 | rendah | TP02 | IPK2.4 | C2 | composition_noncommutative | PARALLEL_BANK_REVIEW |
| 833 | PRE-F-034 | PRE | SM05 | rendah | TP02 | IPK2.4 | C2 | composition_noncommutative | PARALLEL_BANK_REVIEW |
| 834 | PRE-F-035 | PRE | SM08 | sedang | TP04 | IPK4.2 | C3 | inverse_graph_point | PARALLEL_BANK_REVIEW |
| 835 | PRE-F-036 | PRE | SM08 | sedang | TP04 | IPK4.2 | C3 | inverse_graph_point | PARALLEL_BANK_REVIEW |
| 836 | PRE-F-037 | PRE | SM08 | sedang | TP04 | IPK4.2 | C3 | inverse_graph_point | PARALLEL_BANK_REVIEW |
| 837 | PRE-F-038 | PRE | SM08 | sedang | TP04 | IPK4.2 | C3 | inverse_graph_point | PARALLEL_BANK_REVIEW |
| 838 | PRE-F-039 | PRE | SM08 | sedang | TP05 | IPK5.2 | C3 | inverse_composition_value | PARALLEL_BANK_REVIEW |
| 839 | PRE-F-040 | PRE | SM08 | sedang | TP05 | IPK5.2 | C3 | inverse_composition_value | PARALLEL_BANK_REVIEW |
| 840 | PRE-F-041 | PRE | SM08 | sedang | TP05 | IPK5.2 | C3 | inverse_composition_value | PARALLEL_BANK_REVIEW |
| 841 | PRE-F-042 | PRE | SM08 | sedang | TP05 | IPK5.2 | C3 | inverse_composition_value | PARALLEL_BANK_REVIEW |
| 842 | PRE-F-043 | PRE | SM06 | sedang | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 843 | PRE-F-044 | PRE | SM06 | sedang | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 844 | PRE-F-045 | PRE | SM06 | sedang | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 845 | PRE-F-046 | PRE | SM06 | sedang | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 846 | PRE-F-047 | PRE | SM09 | sedang | TP06 | IPK6.2 | C3 | context_inverse | PARALLEL_BANK_REVIEW |
| 847 | PRE-F-048 | PRE | SM09 | sedang | TP06 | IPK6.2 | C3 | context_inverse | PARALLEL_BANK_REVIEW |
| 848 | PRE-F-049 | PRE | SM09 | sedang | TP06 | IPK6.2 | C3 | context_inverse | PARALLEL_BANK_REVIEW |
| 849 | PRE-F-050 | PRE | SM09 | sedang | TP06 | IPK6.2 | C3 | context_inverse | PARALLEL_BANK_REVIEW |
| 850 | PRE-F-051 | PRE | SM01 | sedang | TP01 | IPK1.1 | C2 | fungsi_definition | PARALLEL_BANK_REVIEW |
| 851 | PRE-F-052 | PRE | SM02 | sedang | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 852 | PRE-F-053 | PRE | SM01 | sedang | TP01 | IPK1.3 | C3 | fungsi_value | PARALLEL_BANK_REVIEW |
| 853 | PRE-F-054 | PRE | SM02 | sedang | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 854 | PRE-F-055 | PRE | SM01 | sedang | TP01 | IPK1.2 | C2 | fungsi_range | PARALLEL_BANK_REVIEW |
| 855 | PRE-F-056 | PRE | SM04 | sedang | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 856 | PRE-F-057 | PRE | SM04 | sedang | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 857 | PRE-F-058 | PRE | SM04 | sedang | TP02 | IPK2.2 | C3 | composition_value_two | PARALLEL_BANK_REVIEW |
| 858 | PRE-F-059 | PRE | SM03 | sedang | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 859 | PRE-F-060 | PRE | SM03 | sedang | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 860 | PRE-F-061 | PRE | SM03 | sedang | TP02 | IPK2.1 | C2 | composition_notation_two | PARALLEL_BANK_REVIEW |
| 861 | PRE-F-062 | PRE | SM07 | sedang | TP03 | IPK3.3 | C3 | inverse_quadratic_value_aligned | PARALLEL_BANK_REVIEW |
| 862 | PRE-F-063 | PRE | SM07 | sedang | TP03 | IPK3.3 | C3 | inverse_quadratic_value_aligned | PARALLEL_BANK_REVIEW |
| 863 | PRE-F-064 | PRE | SM07 | sedang | TP03 | IPK3.3 | C3 | inverse_quadratic_value_aligned | PARALLEL_BANK_REVIEW |
| 864 | PRE-F-065 | PRE | SM02 | sedang | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 865 | PRE-F-066 | PRE | SM05 | sedang | TP02 | IPK2.5 | C4 | composition_property_analysis | PARALLEL_BANK_REVIEW |
| 866 | PRE-F-067 | PRE | SM05 | sedang | TP02 | IPK2.5 | C4 | composition_property_analysis | PARALLEL_BANK_REVIEW |
| 867 | PRE-F-068 | PRE | SM08 | tinggi | TP04 | IPK4.3 | C4 | inverse_graph_analysis | PARALLEL_BANK_REVIEW |
| 868 | PRE-F-069 | PRE | SM08 | tinggi | TP04 | IPK4.3 | C4 | inverse_graph_analysis | PARALLEL_BANK_REVIEW |
| 869 | PRE-F-070 | PRE | SM08 | tinggi | TP04 | IPK4.3 | C4 | inverse_graph_analysis | PARALLEL_BANK_REVIEW |
| 870 | PRE-F-071 | PRE | SM08 | tinggi | TP04 | IPK4.3 | C4 | inverse_graph_analysis | PARALLEL_BANK_REVIEW |
| 871 | PRE-F-072 | PRE | SM08 | tinggi | TP05 | IPK5.3 | C4 | inverse_composition_analysis | PARALLEL_BANK_REVIEW |
| 872 | PRE-F-073 | PRE | SM08 | tinggi | TP05 | IPK5.3 | C4 | inverse_composition_analysis | PARALLEL_BANK_REVIEW |
| 873 | PRE-F-074 | PRE | SM08 | tinggi | TP05 | IPK5.3 | C4 | inverse_composition_analysis | PARALLEL_BANK_REVIEW |
| 874 | PRE-F-075 | PRE | SM08 | tinggi | TP05 | IPK5.3 | C4 | inverse_composition_analysis | PARALLEL_BANK_REVIEW |
| 875 | PRE-F-076 | PRE | SM06 | tinggi | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 876 | PRE-F-077 | PRE | SM06 | tinggi | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 877 | PRE-F-078 | PRE | SM06 | tinggi | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 878 | PRE-F-079 | PRE | SM06 | tinggi | TP03 | IPK3.4 | C4 | inverse_domain_analysis | PARALLEL_BANK_REVIEW |
| 879 | PRE-F-080 | PRE | SM09 | tinggi | TP06 | IPK6.3 | C4 | context_analysis | PARALLEL_BANK_REVIEW |
| 880 | PRE-F-081 | PRE | SM09 | tinggi | TP06 | IPK6.3 | C4 | context_analysis | PARALLEL_BANK_REVIEW |
| 881 | PRE-F-082 | PRE | SM09 | tinggi | TP06 | IPK6.3 | C4 | context_analysis | PARALLEL_BANK_REVIEW |
| 882 | PRE-F-083 | PRE | SM09 | tinggi | TP06 | IPK6.3 | C4 | context_analysis | PARALLEL_BANK_REVIEW |
| 883 | PRE-F-084 | PRE | SM01 | tinggi | TP01 | IPK1.1 | C2 | fungsi_definition | HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 884 | PRE-F-085 | PRE | SM02 | tinggi | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 885 | PRE-F-086 | PRE | SM01 | tinggi | TP01 | IPK1.3 | C3 | fungsi_value | PARALLEL_BANK_REVIEW |
| 886 | PRE-F-087 | PRE | SM02 | tinggi | TP01 | IPK1.4 | C3 | fungsi_quotient | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 887 | PRE-F-088 | PRE | SM01 | tinggi | TP01 | IPK1.2 | C2 | fungsi_range | HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 888 | PRE-F-089 | PRE | SM04 | tinggi | TP02 | IPK2.3 | C3 | exponential_three_function_composition | PARALLEL_BANK_REVIEW |
| 889 | PRE-F-090 | PRE | SM04 | tinggi | TP02 | IPK2.3 | C3 | exponential_three_function_composition | PARALLEL_BANK_REVIEW |
| 890 | PRE-F-091 | PRE | SM04 | tinggi | TP02 | IPK2.3 | C3 | exponential_three_function_composition | PARALLEL_BANK_REVIEW |
| 891 | PRE-F-092 | PRE | SM03 | tinggi | TP02 | IPK2.1 | C2 | composition_notation_three | ZERO_QUOTA_CELL_REVIEW, HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 892 | PRE-F-093 | PRE | SM03 | tinggi | TP02 | IPK2.1 | C2 | composition_notation_three | ZERO_QUOTA_CELL_REVIEW, HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 893 | PRE-F-094 | PRE | SM03 | tinggi | TP02 | IPK2.1 | C2 | composition_notation_three | ZERO_QUOTA_CELL_REVIEW, HIGH_C2_DIFFICULTY_REVIEW, PARALLEL_BANK_REVIEW |
| 894 | PRE-F-095 | PRE | SM07 | tinggi | TP03 | IPK3.3 | C3 | inverse_fractional_formula_aligned | PARALLEL_BANK_REVIEW |
| 895 | PRE-F-096 | PRE | SM07 | tinggi | TP03 | IPK3.3 | C3 | inverse_fractional_formula_aligned | PARALLEL_BANK_REVIEW |
| 896 | PRE-F-097 | PRE | SM07 | tinggi | TP03 | IPK3.3 | C3 | inverse_fractional_formula_aligned | PARALLEL_BANK_REVIEW |
| 897 | PRE-F-098 | PRE | SM02 | tinggi | TP01 | IPK1.4 | C3 | fungsi_operation | SM02_TP_REVIEW, PARALLEL_BANK_REVIEW |
| 898 | PRE-F-099 | PRE | SM05 | tinggi | TP02 | IPK2.5 | C4 | composition_property_analysis | PARALLEL_BANK_REVIEW |
| 899 | PRE-F-100 | PRE | SM05 | tinggi | TP02 | IPK2.5 | C4 | composition_property_analysis | PARALLEL_BANK_REVIEW |

## Keputusan audit

Perubahan teknis yang aman: gunakan blueprint sebagai sumber slot paket, validasi shortage tanpa fallback, pertahankan pemilihan deterministik dan pengacakan opsi berbasis ID pilihan, serta normalisasi istilah sumbu. Revisi isi, kunci, TP, submateri, atau tingkat kesulitan ditunda sampai ada persetujuan peneliti/validator.

