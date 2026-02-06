import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Search, Plus, Eye, Trash2 } from 'lucide-react'; // added Eye and Trash2

interface MasterListPageComponent extends React.FC {
  layout?: any;
}

interface Box {
  id: number;
  boxName: string;
  itemCategoryQuantity: number;
}

const MasterList: MasterListPageComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [boxes, setBoxes] = useState<Box[]>([
    { id: 1, boxName: 'Box-001', itemCategoryQuantity: 5 },
    { id: 2, boxName: 'Box-002', itemCategoryQuantity: 4 },
    { id: 3, boxName: 'Box-003', itemCategoryQuantity: 4 },
    { id: 4, boxName: 'Box-004', itemCategoryQuantity: 7 },
    { id: 5, boxName: 'Box-005', itemCategoryQuantity: 3 },
    { id: 6, boxName: 'Box-006', itemCategoryQuantity: 2 },
    { id: 7, boxName: 'Box-007', itemCategoryQuantity: 8 },
    { id: 8, boxName: 'Box-008', itemCategoryQuantity: 6 },
    { id: 9, boxName: 'Box-009', itemCategoryQuantity: 5 },
    { id: 10, boxName: 'Box-010', itemCategoryQuantity: 9 },
  ]);

  const filteredBoxes = boxes.filter((box) =>
    box.boxName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBoxes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBoxes = filteredBoxes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Head title="Master List" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-300 dark:border-gray-600 flex-shrink-0">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Masterlist</h1>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="w-full max-w-6xl mx-auto flex flex-col">
              {/* Search and Add Bar */}
              <div className="flex gap-4 items-center flex-shrink-0 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search Box"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Add box
                </button>
              </div>

              {/* Table */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <table className="w-full border-collapse">
                  <thead className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-center text-sm font-bold text-gray-900 dark:text-white">
                        Box Name
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-bold text-gray-900 dark:text-white">
                        Item Category Quantity
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-bold text-gray-900 dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white dark:bg-gray-800">
                    {currentBoxes.map((box, index) => (
                      <tr
                        key={box.id}
                        className={
                          index !== currentBoxes.length - 1
                            ? 'border-b border-gray-300 dark:border-gray-600'
                            : ''
                        }
                      >
                        <td className="px-4 py-2 text-sm text-center text-gray-900 dark:text-white">
                          {box.boxName}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-900 dark:text-white">
                          {box.itemCategoryQuantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                            View <Eye size={16} />
                          </span>
                          <span className="mx-2 text-gray-400">|</span>
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline cursor-pointer">
                            Delete <Trash2 size={16} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-0.5 text-sm font-bold text-gray-900 dark:text-white disabled:opacity-30"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-0.5 py-0.5 min-w-[28px] text-sm border ${
                        currentPage === page
                          ? 'border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-700 font-bold'
                          : 'border-gray-300 dark:border-gray-600'
                      } text-gray-900 dark:text-white`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-0.5 text-sm font-bold text-gray-900 dark:text-white disabled:opacity-30"
                  >
                    &gt;
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default MasterList;
