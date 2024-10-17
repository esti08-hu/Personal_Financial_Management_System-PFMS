import { motion } from "framer-motion";
import Link from "next/link";
interface BreadcrumbProps {
  pageName: string;
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="flex flex-col justify-between items-center w-full">
      <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center w-full">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {pageName}
        </h2>

        <nav>
          <ol className="flex items-center gap-2 justify-between w-full">
            <li>
              <Link className="font-medium" href="/pages/admin/dashboard">
                Dashboard /
              </Link>
            </li>
            <li className="font-medium text-[#00ABCD]">{pageName}</li>
          </ol>
        </nav>
      </div>
      <motion.hr
        initial={{ width: 0 }}
        animate={{ width: "70%" }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-2 my-8 rounded-lg border-gray"
      />
    </div>
  );
};

export default Breadcrumb;
