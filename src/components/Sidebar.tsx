"use client";

import { Asset, assets } from "@/lib/assets";
import { TickerData } from "@/services/binanceApi";
import AssetItem from "./AssetItem";
import { X, TrendingUp, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface SidebarProps {
    selectedAsset: Asset;
    onSelectAsset: (asset: Asset) => void;
    tickerData: Map<string, TickerData>;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({
    selectedAsset,
    onSelectAsset,
    tickerData,
    isOpen,
    onClose,
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAssets = useMemo(() => {
        if (!searchQuery.trim()) return assets;
        const query = searchQuery.toLowerCase();
        return assets.filter(
            (asset) =>
                asset.name.toLowerCase().includes(query) ||
                asset.ticker.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const sidebarContent = (
        <>
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <h1 className="text-lg font-bold text-slate-100">Coin Tracker</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {filteredAssets.map((asset) => (
                        <AssetItem
                            key={asset.id}
                            asset={asset}
                            ticker={tickerData.get(asset.id)}
                            isSelected={selectedAsset.id === asset.id}
                            onClick={() => {
                                onSelectAsset(asset);
                                onClose();
                            }}
                        />
                    ))}
                </div>

                {filteredAssets.length === 0 && (
                    <div className="text-center text-slate-500 py-8">
                        No assets found
                    </div>
                )}
            </div>

            {/* Footer with data source */}
            <div className="p-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 text-center">
                    Data from Binance • Auto-refreshes every 10s
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={`fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden glass glass-border flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 shrink-0 glass glass-border flex-col h-full">
                {sidebarContent}
            </aside>
        </>
    );
}
