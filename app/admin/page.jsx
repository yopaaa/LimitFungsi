import styles from './page.module.css';

function Page() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Dashboard
                    </h1>
                    <p className={styles.subtitle}>
                        Selamat datang di Admin Panel
                    </p>
                </div>

                <div className={styles.gridContainer}>
                    {/* Card 1 */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>
                            Total Users
                        </div>
                        <div className={styles.cardValue}>
                            1,234
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>
                            Total Posts
                        </div>
                        <div className={styles.cardValue}>
                            567
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>
                            Active Sessions
                        </div>
                        <div className={styles.cardValue}>
                            89
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={styles.activitySection}>
                    <div className={styles.activityHeader}>
                        <h2 className={styles.activityTitle}>
                            Recent Activity
                        </h2>
                    </div>
                    <div className={styles.activityContent}>
                        <p className={styles.emptyMessage}>
                            Tidak ada aktivitas terbaru
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;