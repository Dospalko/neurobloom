import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface LossData {
    epoch: number;
    trainLoss: number;
    testLoss: number;
}

interface LossChartProps {
    data: LossData[];
}

const LossChart: React.FC<LossChartProps> = ({ data }) => {
    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-[#66fcf1] font-bold mb-2">Vývoj Chyby (Loss)</h3>
            <div className="flex-1 w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis 
                            dataKey="epoch" 
                            stroke="#ffffff50" 
                            fontSize={10} 
                            tickFormatter={(val) => val % 100 === 0 ? val : ''}
                        />
                        <YAxis 
                            stroke="#ffffff50" 
                            fontSize={10} 
                            domain={[0, 'auto']}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0b0c10', borderColor: '#ffffff20', color: '#fff' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelStyle={{ color: '#ffffff50', fontSize: '10px' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="trainLoss" 
                            stroke="#45a29e" 
                            strokeWidth={2} 
                            dot={false}
                            name="Tréning"
                            isAnimationActive={false}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="testLoss" 
                            stroke="#ffb74a" 
                            strokeWidth={2} 
                            strokeDasharray="5 5"
                            dot={false}
                            name="Test"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-[#45a29e]"></div>
                    <span className="text-[10px] text-white/60">Tréningová chyba</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-[#ffb74a] border-b border-t border-[#ffb74a] h-[2px]"></div>
                    <span className="text-[10px] text-white/60">Testovacia chyba</span>
                </div>
            </div>
        </div>
    );
};

export default LossChart;
