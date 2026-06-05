import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import '../styles/AnalyticsPanel.css'

function AnalyticsPanel() {
  const { logs } = useStore()
  const [stats, setStats] = useState({
    totalBroadcasts: 0,
    successRate: 0,
    mostActiveServer: 'N/A',
    thisWeek: 0,
    dailyData: Array(7).fill(0),
  })

  useEffect(() => {
    calculateStats()
  }, [logs])

  const calculateStats = () => {
    if (!logs || logs.length === 0) {
      setStats({
        totalBroadcasts: 0,
        successRate: 0,
        mostActiveServer: 'N/A',
        thisWeek: 0,
        dailyData: Array(7).fill(0),
      })
      return
    }

    // Total broadcasts
    const totalBroadcasts = logs.length

    // Success rate
    const successfulLogs = logs.filter((log) => log.status === 'success').length
    const successRate =
      totalBroadcasts > 0
        ? Math.round((successfulLogs / totalBroadcasts) * 100)
        : 0

    // Most active server (or channel)
    const channelCounts = {}
    logs.forEach((log) => {
      const channel = log.channel || 'Unknown'
      channelCounts[channel] = (channelCounts[channel] || 0) + 1
    })
    const mostActiveServer =
      Object.keys(channelCounts).length > 0
        ? Object.entries(channelCounts).reduce((a, b) =>
            b[1] > a[1] ? b : a
          )[0]
        : 'N/A'

    // This week count
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeek = logs.filter((log) => {
      const logDate = new Date(log.created_at)
      return logDate >= oneWeekAgo && logDate <= now
    }).length

    // Daily data for 7-day chart
    const dailyData = Array(7).fill(0)
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)

      const dayCount = logs.filter((log) => {
        const logDate = new Date(log.created_at)
        return logDate >= date && logDate < nextDate
      }).length

      dailyData[i] = dayCount
    }

    setStats({
      totalBroadcasts,
      successRate,
      mostActiveServer,
      thisWeek,
      dailyData,
    })
  }

  // Find max value for chart scaling
  const maxDaily = Math.max(...stats.dailyData, 1)

  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <h2>◈ ANALYTICS DASHBOARD</h2>
        <span className="analytics-subtext">Real-time broadcast statistics</span>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL BROADCASTS</div>
          <div className="stat-value">{stats.totalBroadcasts}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">SUCCESS RATE</div>
          <div className="stat-value">{stats.successRate}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">MOST ACTIVE</div>
          <div className="stat-value">{stats.mostActiveServer}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">THIS WEEK</div>
          <div className="stat-value">{stats.thisWeek}</div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="chart-container">
        <h3>TRANSMISSIONS — 7-DAY TREND</h3>
        <div className="chart-wrapper">
          <div className="chart-bars">
            {stats.dailyData.map((count, idx) => {
              const height = maxDaily > 0 ? (count / maxDaily) * 100 : 0
              const today = new Date()
              const day = new Date(today.getTime() - (6 - idx) * 24 * 60 * 60 * 1000)
              const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                day.getDay()
              ]

              return (
                <div key={idx} className="chart-bar-column">
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ height: `${height}%` }}
                      title={`${dayLabel}: ${count} broadcasts`}
                    >
                      {count > 0 && (
                        <span className="chart-bar-label">{count}</span>
                      )}
                    </div>
                  </div>
                  <span className="chart-label">{dayLabel}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPanel
