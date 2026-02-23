export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Usher':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'Usherette':
      return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300';
    case 'Hoclomac':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    default:
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
  }
};