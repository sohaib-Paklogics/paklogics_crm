
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

interface CustomPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomPagination = ({ page, totalPages, onPageChange }: CustomPaginationProps) => {
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 border-t md:flex-row bg-muted/50 rounded-xl shadow-sm">
      <div className="flex">
        <p className="text-sm text-muted-foreground">
          Showing page <span className="font-semibold text-primary">{page}</span> of{" "}
          <span className="font-semibold text-primary">{totalPages}</span>
        </p>
      </div>
      <div className="flex">
        <Pagination>
          <PaginationContent className="gap-2">
            <PaginationItem>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full px-4"
                onClick={() => onPageChange(page - 1)}
                disabled={isFirstPage}
              >
                <PaginationPrevious className="mr-2" />
              </Button>
            </PaginationItem>

            <PaginationItem>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full px-4"
                onClick={() => onPageChange(page + 1)}
                disabled={isLastPage}
              >
                <PaginationNext className="ml-2" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default CustomPagination;
