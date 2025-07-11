import React from "react";
import { History, Star, ArrowRightLeft } from "lucide-react";

interface HistoryListProps {
  history: Array<{
    title: string;
    url: string;
    device: string;
    time: string;
    visits: number;
  }>;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history }) => (
  <div className="space-y-4">
    {history.map((item, index) => (
      <div
        key={index}
        className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium truncate">{item.title}</h3>
              <p className="text-sm text-gray-400 truncate">{item.url}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">{item.device}</span>
            <span className="text-sm text-gray-400">{item.time}</span>
            <span className="text-sm text-gray-500">{item.visits} visits</span>
            <Star className="w-4 h-4 text-white" />
            <ArrowRightLeft className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
