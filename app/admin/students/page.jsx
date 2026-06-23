"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { pb } from "@/utils/db";
import {
  LuSearch,
  LuUser,
  LuMail,
  LuCalendar,
  LuSchool,
  LuInfo,
} from "react-icons/lu";
import Modal from "@/components/UI/Modal";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const records = await pb
          .collection("limit_subscriptions")
          .getFullList()
          .then((subscriptions) => {
            const userIds = subscriptions.map((sub) => sub.user_id);
            return pb
              .collection("limit_users")
              .getFullList()
              .then((users) =>
                users.filter((user) => userIds.includes(user.id)),
              );
          });
        setStudents(records);
      } catch (error) {
        console.error("Gagal mengambil data mahasiswa:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.instansi?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title} >
          Daftar Mahasiswa
        </h1>
        <p className={styles.subtitle}>
          Kelola dan pantau mahasiswa yang telah bergabung di platform Limit
          Fungsi.
        </p>
      </div>

      <div className={styles.actionRow}>
        <div className={styles.searchWrapper}>
          <LuSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama, email, atau instansi..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Lengkap</th>
                <th>Instansi</th>
                <th>Email</th>
                <th>Tanggal Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div className={styles.avatarMini}>
                          {student.profile ? (
                            <img
                              src={pb.files.getURL(student, student.profile)}
                              alt="Profile"
                              className={styles.avatarImg}
                            />
                          ) : (
                            student.nama?.charAt(0).toUpperCase() ||
                            student.username?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span style={{ fontWeight: "600" }}>
                            {student.nama}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {student.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <LuSchool size={14} />
                        {student.instansi || "-"}
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>
                      {new Date(student.created).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => handleOpenModal(student)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Tidak ada mahasiswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Detail Mahasiswa"
      >
        {selectedStudent && (
          <div className={styles.modalContent}>
            <div className={styles.modalAvatarSection}>
              <div className={styles.avatarLarge}>
                {selectedStudent.profile ? (
                  <img
                    src={pb.files.getURL(selectedStudent, selectedStudent.profile)}
                    alt="Profile"
                    className={styles.avatarImg}
                  />
                ) : (
                  selectedStudent.nama?.charAt(0).toUpperCase() ||
                  selectedStudent.username?.charAt(0).toUpperCase()
                )}
                {/* {selectedStudent.nama?.charAt(0).toUpperCase()} */}
              </div>
              <h3 className={styles.modalName}>{selectedStudent.nama}</h3>
              <span className={styles.modalBadge}>Mahasiswa</span>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <LuInfo className={styles.detailIcon} />
                <div>
                  <label>ID Pengguna</label>
                  <p>{selectedStudent.id}</p>
                </div>
              </div>
              <div className={styles.detailItem}>
                <LuMail className={styles.detailIcon} />
                <div>
                  <label>Email</label>
                  <p>{selectedStudent.email}</p>
                </div>
              </div>
              <div className={styles.detailItem}>
                <LuSchool className={styles.detailIcon} />
                <div>
                  <label>Instansi</label>
                  <p>{selectedStudent.instansi || "-"}</p>
                </div>
              </div>
              <div className={styles.detailItem}>
                <LuCalendar className={styles.detailIcon} />
                <div>
                  <label>Bergabung Sejak</label>
                  <p>
                    {new Date(selectedStudent.created).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsPage;
