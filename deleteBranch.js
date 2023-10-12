import fetch from 'node-fetch';
import XLSX from 'xlsx';

const accessToken = 'KxmbpRrx3Zs54ZfszuKX';
const gitlabHost = 'git.ienglish.cn'; // 请将此处替换为实际的 GitLab 主机名

async function deleteExpiredBranches(excelFilePath) {
    try {
        const workbook = XLSX.readFile(excelFilePath);
        const worksheet = workbook.Sheets['Projects'];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const projectNameIndex = data[0].indexOf('项目ID');
        const branchNameIndex = data[0].indexOf('分支名称');
        const expiredIndex = data[0].indexOf('是否过期');

        // 遍历每一行数据，找到 "是" 的行并删除对应的分支
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const projectName = row[projectNameIndex];
            const branchName = row[branchNameIndex];
            const expired = row[expiredIndex];


            if (expired === '是') {
                await deleteBranch(projectName, branchName);
            }
        }

        console.log('Expired branches deleted successfully.');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteBranch(projectName, branchName) {
    try {
        const encodedProjectName = encodeURIComponent(projectName);
        const encodedBranchName = encodeURIComponent(branchName);
        const url = `http://${gitlabHost}/api/v4/projects/${encodedProjectName}/repository/branches/${encodedBranchName}`;
        const options = {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        };
        const response = await fetch(url, options);

        if (response.ok) {
            console.log(`Branch "${branchName}" in project "${projectName}" deleted successfully.`);
        } else {
            console.log(response)
            console.error(`Failed to delete branch "${branchName}" in project "${projectName}".`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

deleteExpiredBranches('后台管理系统.xlsx');