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

    const {data: testCases, refetch} = useGetTestCases(snippetId);
    const {mutateAsync: postTestCase} = usePostTestCase(snippetId);
    const {mutateAsync: removeTestCase} = useRemoveTestCase({
        onSuccess: () => queryClient.invalidateQueries('testCases')
    });
    
    const handleSaveTest = async (test: Partial<import("../../types/TestCase.ts").TestCase>) => {
        const savedTest = await postTestCase(test);

        // Immediately refetch to get updated list
        await refetch();

        // Wait for the refetch to complete and update the state
        await new Promise(resolve => setTimeout(resolve, 150));

        // Get the updated test cases from the cache
        const updatedTestCases = queryClient.getQueryData<typeof testCases>(['testCases', snippetId]);

        // Find the index of the newly saved test
        const newIndex = updatedTestCases?.findIndex(tc => tc.id === savedTest.id) ?? 0;

        // Switch to the new test's tab
        setValue(newIndex);

        return savedTest;
    };

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // Calculate the index for the "add new test" tab
    const addNewTestIndex = (testCases?.length ?? 0);

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
                    <IconButton disableRipple onClick={() => setValue(addNewTestIndex)}>
                        <AddRounded />
                    </IconButton>
                </Tabs>
                {testCases?.map((testCase, index) => (
                    <TabPanel key={testCase.id || index} index={index} value={value} test={testCase} snippetId={snippetId}
                              setTestCase={handleSaveTest}
                              removeTestCase={(testCaseId) => removeTestCase({ snippetId, testCaseId })}
                    />
                ))}
                <TabPanel index={addNewTestIndex} value={value} snippetId={snippetId}
                          setTestCase={handleSaveTest}
                />
            </Box>
        </ModalWrapper>
    )
}
