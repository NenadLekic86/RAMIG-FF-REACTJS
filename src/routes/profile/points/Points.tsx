export default function Points() {
  const totalPoints = 318315;
  const twitterHandle = 'STOIIC';
  const discordHandle = 'STOICC_';

  const history: Array<{ points: number; datetime: string }> = [
    { points: 1245, datetime: 'September 10, 2025 at 2:00:00 PM UTC' },
    { points: 4155, datetime: 'September 3, 2025 at 2:00:00 PM UTC' },
    { points: 1123, datetime: 'August 27, 2025 at 2:00:00 PM UTC' },
    { points: 4123, datetime: 'August 20, 2025 at 2:00:00 PM UTC' },
    { points: 1734, datetime: 'August 13, 2025 at 2:00:00 PM UTC' },
    { points: 920, datetime: 'August 6, 2025 at 2:00:00 PM UTC' },
    { points: 1043, datetime: 'July 30, 2025 at 2:00:00 PM UTC' },
    { points: 2003, datetime: 'July 30, 2025 at 2:00:00 PM UTC' },
    { points: 1822, datetime: 'July 30, 2025 at 2:00:00 PM UTC' },
  ];

  return (
    <div className="rounded-[24px] border border-customBorder bg-[#171717] overflow-hidden flex flex-col">
        {/* Summary cards */}
        <div className="flex flex-row items-center gap-4 border-b border-customGray44 px-4 py-3">
            <div className="basis-auto border-r border-customGray44 bg-[#171717] p-4 pr-8">
                <div className="text-[14px] font-heading">{totalPoints.toLocaleString()}</div>
                <div className="text-sm text-white/44 mt-1">Total Points</div>
            </div>
            <div className="basis-auto border-r border-customGray44 bg-[#171717] p-4 pr-8">
                <div className="text-[14px] font-heading">Connected as {twitterHandle}</div>
                <div className="text-sm text-white/44 mt-1">Twitter</div>
            </div>
            <div className="basis-auto bg-[#171717] p-4 pr-8">
                <div className="text-[14px] font-heading">Connected as {discordHandle}</div>
                <div className="text-sm text-white/44 mt-1">Discord</div>
            </div>
        </div>

        {/* Points history table */}
        <div className="px-8 pt-3 pb-0 flex flex-col min-h-0">
            <div className="text-sm py-3 text-white/44 grid grid-cols-2 border-b border-divider">
                <div>Points</div>
                <div className="text-right">Date & Time</div>
            </div>
            <div className="overflow-y-auto scroll-thin max-h-[60vh] pr-1">
                <ul className="divide-y divide-divider">
                    {history.map((row, idx) => (
                    <li key={idx} className="py-4 grid grid-cols-2 items-center">
                        <div className="text-[#039855] font-heading">+{row.points.toLocaleString()}</div>
                        <div className="text-right text-white/44">{row.datetime}</div>
                    </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
  );
}