import {Box,  Divider, IconButton, Tab, Tabs, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {SyntheticEvent, useState} from "react";
import {AddRounded} from "@mui/icons-material";
import {useGetTestCases, usePostTestCase, useRemoveTestCase} from "../../utils/queries.tsx";
import {TabPanel} from "./TabPanel.tsx";
import {queryClient} from "../../App.tsx";

type TestSnippetModalProps = {
    open: boolean
    onClose: () => void
    snippetId: string
}

export const TestSnippetModal = ({open, onClose, snippetId}: TestSnippetModalProps) => {
    const [value, setValue] = useState(0);

    const {data: testCases} = useGetTestCases(snippetId);
    const {mutateAsync: postTestCase} = usePostTestCase(snippetId);
    const {mutateAsync: removeTestCase} = useRemoveTestCase({
        onSuccess: () => queryClient.invalidateQueries('testCases')
    });
    
    const handleSaveTest = async (test: Partial<import("../../types/TestCase.ts").TestCase>) => {
        const savedTest = await postTestCase(test);
        // Refresh test cases list
        await queryClient.invalidateQueries(['testCases', snippetId]);
        // Wait a bit for the query to refetch
        setTimeout(() => {
            const currentTestCases = queryClient.getQueryData<typeof testCases>(['testCases', snippetId]);
            // Find the index of the newly saved test
            const newIndex = currentTestCases?.findIndex(tc => tc.id === savedTest.id) ?? 0;
            setValue(newIndex);
        }, 100);
        return savedTest;
    };

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Typography variant={"h5"}>Test snippet</Typography>
            <Divider/>
            <Box mt={2} display="flex">
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{borderRight: 1, borderColor: 'divider'}}
                >
                    {testCases?.map((testCase, index) => (
                        <Tab key={testCase.id || index} label={testCase.name}/>
                    ))}
                    <IconButton disableRipple onClick={() => setValue((testCases?.length ?? 0) + 1)}>
                        <AddRounded />
                    </IconButton>
                </Tabs>
                {testCases?.map((testCase, index) => (
                    <TabPanel key={testCase.id || index} index={index} value={value} test={testCase} snippetId={snippetId}
                              setTestCase={handleSaveTest}
                              removeTestCase={(testCaseId) => removeTestCase({ snippetId, testCaseId })}
                    />
                ))}
                <TabPanel index={(testCases?.length ?? 0) + 1} value={value} snippetId={snippetId}
                          setTestCase={handleSaveTest}
                />
            </Box>
        </ModalWrapper>
    )
}
