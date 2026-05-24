"use client";

import React from 'react';
import styles from './page.module.css';
import { LuUser, LuFileText, LuActivity, LuArrowRight,  } from 'react-icons/lu';
import Button from '@/components/UI/Button';

const Page = () => {
    const [stats, setStats] = React.useState([
        {
            label: "Total Mahasiswa",
            value: "0",
            icon: <LuUsers />,
            color: "var(--primary)"
        },
        {
            label: "Total Kelas",
            value: "0",
            icon: <LuFileText />,
            color: "var(--accent)"
        },
        {
            label: "Active Sessions",
            value: "-",
            icon: <LuActivity />,
            color: "var(--success)"
        }
    ]);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                // Ambil jumlah mahasiswa (role=user)
                const students = await pb.collection('limit_users').getList(1, 1, {
                    filter: 'role = "user"'
                });

                // Ambil jumlah kelas
                const classes = await pb.collection('limit_classes').getList(1, 1);

                setStats(prev => [
                    { ...prev[0], value: students.totalItems.toLocaleString() },
                    { ...prev[1], value: classes.totalItems.toLocaleString() },
                    prev[2]
                ]);
            } catch (error) {
                console.error("Gagal mengambil statistik:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title} style={{ color: "var(--primary)" }}>
                        Dashboard Overview
                    </h1>
                    <p className={styles.subtitle}>
                        Selamat datang kembali, Admin. Berikut ringkasan statistik hari ini.
                    </p>
                </div>

                <div className={styles.gridContainer}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div className={styles.cardLabel}>{stat.label}</div>
                                <div style={{ fontSize: '24px', color: stat.color }}>{stat.icon}</div>
                            </div>
                            <div className={styles.cardValue}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.activitySection}>
                    <div className={styles.activityHeader}>
                        <h2 className={styles.activityTitle}>
                            Recent Activity
                        </h2>
                    </div>
                    <div className={styles.activityContent}>
                        <div className={styles.emptyState}>
                            <LuActivity size={40} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                            <p className={styles.emptyMessage}>
                                Tidak ada aktivitas terbaru untuk ditampilkan saat ini.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
