import React, { useState } from 'react';
import { ProductSummary } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const ProductTable: React.FC<{ products: ProductSummary[] }> = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const totalRevenue = products.reduce((acc, p) => acc + p.totalRevenue, 0);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Units Sold</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Revenue</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentProducts.map((product) => {
              const percentage = totalRevenue > 0 ? (product.totalRevenue / totalRevenue) * 100 : 0;

              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{product.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 text-right">{product.unitsSold}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 font-semibold text-right">
                    ${(product.totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs">{percentage.toFixed(1)}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stripe-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
          <div className="text-xs text-slate-500">
            Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs text-slate-600 font-medium min-w-[60px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};