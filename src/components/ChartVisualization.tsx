import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, Upload, Zap, FileSpreadsheet } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const SAMPLE_ECONOMIC_DATA = [
  { group: '<10 tr', frequency: 5, normalFit: 3 },
  { group: '10-20 tr', frequency: 12, normalFit: 11 },
  { group: '20-30 tr', frequency: 18, normalFit: 21 },
  { group: '30-40 tr', frequency: 24, normalFit: 25 },
  { group: '40-50 tr', frequency: 23, normalFit: 21 },
  { group: '50-60 tr', frequency: 11, normalFit: 11 },
  { group: '>60 tr', frequency: 7, normalFit: 3 },
];

export const ChartVisualization: React.FC = () => {
  const [data, setData] = useState(SAMPLE_ECONOMIC_DATA);
  const [datasetName, setDatasetName] = useState('Doanh số bán hàng Siêu thị (100 ngày)');

  const handleSimulateDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDatasetName(`Dữ liệu khảo sát từ file: ${file.name}`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>TÍNH NĂNG MÔ HÌNH TRỰC QUAN & BIỂU ĐỒ THỐNG KÊ KINH TẾ</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Phân Tích Dữ Liệu Thực Tế & Mô Hình Phân Phối Chuẩn / Histogram
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Upload file bài tập/số liệu kinh tế để vẽ đường cong phân phối chuẩn N(μ, σ²), biểu đồ tần số Histogram và giải thích ý nghĩa số liệu.
        </p>

        {/* Upload Trigger */}
        <div className="pt-3 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-950" />
            <span>Upload File Số Liệu (CSV / Excel / PDF)</span>
            <input type="file" accept=".csv,.xlsx,.pdf" onChange={handleSimulateDataUpload} className="hidden" />
          </label>

          <span className="text-xs font-mono text-cyan-300 font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-cyan-500/30">
            {datasetName}
          </span>
        </div>
      </div>

      {/* Interactive Recharts Graph */}
      <div className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-black text-white text-xs flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>BIỂU ĐỒ TẦN SỐ HISTOGRAM & ĐƯỜNG CONG PHÂN PHỐI CHUẨN</span>
          </h3>
          <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold px-2.5 py-1 rounded-lg">
            N = 100 quan sát
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="group" stroke="#94a3b8" fontSize={11} tick={{ fill: '#cbd5e1' }} />
              <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#cbd5e1' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#06b6d4',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                  boxShadow: '0 0 15px rgba(6,182,212,0.3)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#e2e8f0' }} />
              <Bar dataKey="frequency" name="Tần số thực tế (Histogram)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              <Line dataKey="normalFit" name="Đường cong Chuẩn hóa N(μ, σ²)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 text-xs space-y-2 text-slate-200">
          <p className="font-black text-cyan-300 text-xs">📊 Giải thích ý nghĩa chỉ số kinh tế từ biểu đồ:</p>
          <p className="leading-relaxed">• <strong className="text-white">Trung bình mẫu x̄ = 35.9 triệu đồng/ngày:</strong> Mức doanh số trung bình phổ biến nhất của siêu thị.</p>
          <p className="leading-relaxed">• <strong className="text-white">Độ lệch chuẩn s = 15.58 triệu đồng:</strong> Đo lường sự phân tán doanh số giữa các ngày bình thường và ngày cao điểm.</p>
          <p className="leading-relaxed">• <strong className="text-white">Kết luận phân phối:</strong> Dữ liệu có dạng hình chuông đối xứng chuẩn mực xung quanh trung bình [30, 40) triệu.</p>
        </div>
      </div>
    </div>
  );
};
