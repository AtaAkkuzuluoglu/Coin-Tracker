"use client";

import { useState } from "react";
import { Asset, assets } from "@/lib/assets";
import { Timeframe } from "@/services/binanceApi";
import { ActiveIndicators, defaultIndicators, IndicatorType } from "@/lib/indicators";
import { useChartData, useTickers } from "@/hooks";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Chart from "@/components/Chart";
import TimeframeSelector from "@/components/TimeframeSelector";
import IndicatorSelector from "@/components/IndicatorSelector";
import NewsPanel from "@/components/NewsPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { RefreshCw, Newspaper } from "lucide-react";

export default function Home() {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  // Technical indicators state
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicators>(defaultIndicators);

  // Use custom hooks for data fetching
  const { chartData, isLoading, lastUpdated, refetch: refetchChart } = useChartData(selectedAsset, timeframe);
  const { tickerData, refetch: refetchTickers } = useTickers(assets);

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleSelectTimeframe = (tf: Timeframe) => {
    setTimeframe(tf);
  };

  const handleToggleIndicator = (indicator: IndicatorType) => {
    setActiveIndicators((prev) => ({
      ...prev,
      [indicator]: !prev[indicator],
    }));
  };

  const handleRefresh = () => {
    refetchTickers();
    refetchChart();
  };

  // Get current asset's ticker data
  const currentTicker = tickerData.get(selectedAsset.id);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-950 dark:bg-slate-950 light:bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        selectedAsset={selectedAsset}
        onSelectAsset={handleSelectAsset}
        tickerData={tickerData}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 overflow-hidden">
        {/* Header */}
        <Header
          asset={selectedAsset}
          ticker={currentTicker}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Chart Area */}
        <div className="flex-1 glass glass-border rounded-xl overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 dark:border-slate-700/50 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 dark:text-slate-400">Candlestick</span>
              <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                LIVE
              </span>
              {lastUpdated && (
                <span className="text-xs text-slate-500 hidden sm:block">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-400 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Indicator Selector */}
              <IndicatorSelector
                activeIndicators={activeIndicators}
                onToggleIndicator={handleToggleIndicator}
              />

              {/* News Button */}
              <button
                onClick={() => setNewsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-slate-700/50 transition-all"
              >
                <Newspaper className="w-4 h-4" />
                <span className="hidden sm:inline">News</span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Timeframe Selector */}
              <TimeframeSelector
                selectedTimeframe={timeframe}
                onSelectTimeframe={handleSelectTimeframe}
              />
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 p-2 min-h-0 relative">
            {isLoading && chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-slate-400">Loading chart data...</span>
                </div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-slate-400">
                  No data available for {selectedAsset.ticker}
                </span>
              </div>
            ) : (
              <Chart
                data={chartData}
                asset={selectedAsset}
                activeIndicators={activeIndicators}
              />
            )}
          </div>
        </div>
      </main>

      {/* News Panel */}
      <NewsPanel
        asset={selectedAsset}
        isOpen={newsOpen}
        onClose={() => setNewsOpen(false)}
      />
    </div>
  );
}
