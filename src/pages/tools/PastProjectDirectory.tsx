"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { WhatsappNotification } from "@/components/WhatsappNotification";


const departments = [
    "ACCOUNTING",
    "ACCOUNTANCY",
    "BANKING & FINANCE",
    "ARCHITECTURE",
    "BIOCHEMISTRY",
    "BUSINESS ADMINISTRATION",
    "CHEMICAL ENGINEERING",
    "COMPUTER ENGINEERING",
    "COMPUTER SCIENCE",
    "ECONOMICS",
    "ELECTRICAL AND ELECTRONICS ENGINEERING",
    "ENGLISH",
    "ESTATE MANAGEMENT",
    "INDUSTRIAL RELATIONS AND PERSONNEL MANAGEMENT",
    "INDUSTRIAL CHEMISTRY",
    "INDUSTRIAL RELATIONS MANAGEMENT",
    "MARKETING",
    "MASS COMMUNICATION",
    "MECHANICAL ENGINEERING",
    "MICROBIOLOGY",
    "POLITICAL SCIENCE",
    "PSYCHOLOGY",
    "PUBLIC ADMIN",
    "SOCIOLOGY"
];

const departmentLinks = {
    "ACCOUNTING": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "ACCOUNTANCY": "https://drive.google.com/drive/folders/1FjOpkB9tkkiS0fNqjCr0QpX47hOxJlqM?usp=sharing",
    "BANKING & FINANCE": "https://drive.google.com/drive/folders/1m-EZGwdzwu2pMFwop9x9aITvq_bdK4wL?usp=sharing",
    "ARCHITECTURE": "https://drive.google.com/drive/folders/1H9N6i-HGlBLNYDsxt4UwcLek3Q-i9yxL?usp=sharing",
    "BIOCHEMISTRY": "https://drive.google.com/drive/folders/1hAZ4cS1WPFwDTgtYXfS9YH8ZDmzr6AbV?usp=sharing",
    "BUSINESS ADMINISTRATION": "https://drive.google.com/drive/folders/1PmX_gx_fXZ_jr5HHYnMRowlkKpNeEMcL?usp=sharing",
    "CHEMICAL ENGINEERING": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "COMPUTER ENGINEERING": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "COMPUTER SCIENCE": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "ECONOMICS": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "ELECTRICAL AND ELECTRONICS ENGINEERING": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "ENGLISH": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "ESTATE MANAGEMENT": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "INDUSTRIAL RELATIONS AND PERSONNEL MANAGEMENT": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "INDUSTRIAL CHEMISTRY": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "INDUSTRIAL RELATIONS MANAGEMENT": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "MARKETING": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "MASS COMMUNICATION": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "MECHANICAL ENGINEERING": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "MICROBIOLOGY": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "POLITICAL SCIENCE": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "PSYCHOLOGY": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "PUBLIC ADMIN": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing",
    "SOCIOLOGY": "https://drive.google.com/drive/folders/1isaVACCWEfe7fGircqzj2fktW4mLi8FO?usp=sharing"
};  // Fixed: Removed trailing comma after last property

export default function PastProjectDirectory() {
    const [email, setEmail] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleVerifyEmail = () => {
        if (!email || !validateEmail(email)) {
            setError("Please enter a valid email");
            return;
        }
        if (!selectedDepartment) {
            setError("Please select a department");
            return;
        }

        setIsLoading(true);
        setError("");

        setTimeout(() => {
            setIsVerified(true);
            setIsLoading(false);
            // Removed the field clearing here
        }, 1000);
    };

    const handleOpenFolder = (department: string) => {
        const link = departmentLinks[department as keyof typeof departmentLinks];
        if (link) {
            window.open(link, "_blank");
        }
    };

    // Filter to show only the selected department
    const filteredDepartments = departments.filter(
        (dept) => dept === selectedDepartment
    );

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 text-center">Past Projects Directory</h1>
                <p className="text-lg text-gray-600 mb-6 text-center">Browse projects by department</p>

                <Card className="p-6 w-full max-w-4xl mx-auto mb-6">  {/* Changed to max-w-4xl and added w-full */}
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Enter your email to continue
                            </label>
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Select Department
                            </label>
                            <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button
                            onClick={handleVerifyEmail}
                            disabled={isLoading}
                            className="w-full bg-black text-white hover:bg-gray-800"
                        >
                            {isLoading ? "Verifying..." : "Load Directory"}
                        </Button>

                        {/* Centered text below button */}
                        <p className="text-xs text-black mt-2 text-center">
                            If you'd like to add to this directory{' '}
                            <a
                                href="#"
                                className="font-medium underline hover:underline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Add your click handler here
                                }}
                            >
                                Click Here
                            </a>
                        </p>
                    </CardContent>
                </Card>

                {isVerified && (
                    <>
                        <Card className="p-4 sm:p-6 mb-3 w-full max-w-4xl mx-auto">
                            <CardContent className="overflow-x-auto">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-auto sm:w-[400px] min-w-[200px]">
                                                Department
                                            </TableHead>
                                            <TableHead className="text-right w-[100px] sm:w-[150px]">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDepartments.map((dept) => (
                                            <TableRow key={dept}>
                                                <TableCell className="font-medium whitespace-nowrap text-sm sm:text-base">
                                                    {dept}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenFolder(dept)}
                                                        className="text-xs sm:text-sm bg-black text-white hover:bg-gray-800"
                                                    >
                                                        Open
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Replaced notification box with component */}
                        <WhatsappNotification onClose={() => setIsVerified(false)} />
                    </>
                )}
            </div>
        </div>
    );
}
