"use client";
export default function TransactionTable({ items }) {
  if (!items?.length) {
    return <div className="text-slate-500 text-sm">No transactions yet.</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left">
          <tr>
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Details</th>
            <th className="py-2 pr-4">Amount</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t, i) => (
            <tr key={i} className="border-t">
              <td className="py-2 pr-4">{t.date}</td>
              <td className="py-2 pr-4">{t.type}</td>
              <td className="py-2 pr-4">{t.details}</td>
              <td className="py-2 pr-4">₦{t.amount.toLocaleString()}</td>
              <td className="py-2">
                <span className="badge">{t.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
