import React from 'react';
import { Eye, EyeOff, Key, Shield } from 'lucide-react';

export const PasswordList = ({ passwords, showPasswords, toggleVisibility }) => (
  <div className="space-y-4">
    {passwords.map((item, index) => (
      <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium">{item.site}</h3>
              <p className="text-sm text-gray-400">{item.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-white/10 px-2 py-1 rounded">{item.strength}</span>
            <span className="text-sm text-gray-400">{item.lastUpdated}</span>
            <button className="p-2 hover:bg-white/10 rounded-lg" onClick={toggleVisibility}>
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <Key className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
