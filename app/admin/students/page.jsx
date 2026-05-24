"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { pb } from '@/utils/db';
import { LuSearch, LuUser, LuMail, LuCalendar, LuSchool } from 'react-icons/lu';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Berdasarkan POCKETBASE_SCHEMA.md:
        // - Nama koleksi: limit_users
        // - Filter role: user (untuk mahasiswa)
        const records = await pb.collection('limit_subscriptions').getFullList()
          .then(subscriptions => {
            console.log(subscriptions);
            
            const userIds = subscriptions.map(sub => sub.user_id);
            return pb.collection('limit_users').getFullList()
              .then(users => users.filter(user => userIds.includes(user.id)));

          });
        console.log("Data mahasiswa yang diambil:", records);
        setStudents(records);
      } catch (error) {
        console.error("Gagal mengambil data mahasiswa:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.instansi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: "var(--primary)" }}>Daftar Mahasiswa</h1>
        <p className={styles.subtitle}>Kelola dan pantau mahasiswa yang telah bergabung di platform Limit Fungsi.</p>
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={styles.avatarMini}>
                          {student.nama?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{student.nama}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <LuSchool size={14} />
                        {student.instansi || '-'}
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{new Date(student.created).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>
                      <button className={styles.viewBtn}>Detail</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada mahasiswa ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
