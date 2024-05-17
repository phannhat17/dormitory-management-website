import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReusableAlertDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    description: string;
    confirmButtonText: string;
    cancelButtonText: string;
    onConfirm: () => void;
}

const ReusableAlertDialog: React.FC<ReusableAlertDialogProps> = ({ isOpen, setIsOpen, title, description, confirmButtonText, cancelButtonText, onConfirm }) => {

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsOpen(false)}>{cancelButtonText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmButtonText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default ReusableAlertDialog;