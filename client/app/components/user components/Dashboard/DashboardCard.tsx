import { motion } from 'framer-motion';

const DashboardCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
  }> = ({ icon, title, value }) => (
    <motion.div className="p-6 flex items-center justify-center rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default">
      <div className="mr-4 md:text-sm">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
        <p className="text-lg font-bold text-center">{value}</p>
      </div>
    </motion.div>
  );
export default DashboardCard