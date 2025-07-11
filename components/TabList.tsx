import React from "react";
import { ExternalLink, ArrowRightLeft, Star } from "lucide-react";

export const TabList = ({ tabs }) => (
  <div className="space-y-4">
    {tabs.map((tab) => (
      <div
        key={tab.id}
        className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-xl">
              {tab.favicon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">{tab.title}</h3>
              <p className="text-sm text-gray-400 truncate">{tab.url}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-sm text-gray-300">{tab.device}</span>
              <p className="text-xs text-gray-500">{tab.browser}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Star className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowRightLeft className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
