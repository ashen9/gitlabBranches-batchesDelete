import fetch from 'node-fetch';
import XLSX from 'xlsx';

const accessToken = 'XXXXXXX';

async function getProjects(groupId) {
    const url = `http://git.ienglish.cn/api/v4/groups/${groupId}/projects?per_page=100&private_token=${accessToken}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
        throw new Error(`Failed to fetch projects. Status: ${response.status}`);
    }
    const projects = await response.json();
    return projects;
}

async function getBranches(projectId) {
    const url = `http://git.ienglish.cn/api/v4/projects/${projectId}/repository/branches?private_token=${accessToken}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
        throw new Error(`Failed to fetch branches. Status: ${response.status}`);
    }
    const branches = await response.json();
    return branches;
}

async function getCommitInfo(projectId, branchName) {
    const encodedBranchName = encodeURIComponent(branchName);
    const url = `http://git.ienglish.cn/api/v4/projects/${projectId}/repository/commits?ref_name=${encodedBranchName}&private_token=${accessToken}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
        throw new Error(`Failed to fetch commit info. Status: ${response.status}`);
    }
    const commits = await response.json();
    return commits;
}

async function getBranchInfo(projectId, branchName) {
    const encodedBranchName = encodeURIComponent(branchName);
    const commits = await getCommitInfo(projectId, branchName);

    // 按照提交时间排序
    commits.sort((a, b) => new Date(a.committed_date) - new Date(b.committed_date));

    const branch = {
        name: branchName,
        creator: commits[0].committer_name,
        create_time: new Date(commits[0].committed_date),
        lastModifierName: commits[commits.length - 1].committer_name,
        lastModifiedDate: new Date(commits[commits.length - 1].committed_date)
    };

    return branch;
}

async function generateExcel(groupId) {
    const projects = await getProjects(groupId);

    const data = [['项目名称', '项目ID', '分支名称','分支创建人', '创建时间', '分支最后修改人', '分支最后修改时间','是否过期']];

    for (const project of projects) {
        const branches = await getBranches(project.id);

        for (const branch of branches) {
            const branchInfo = await getBranchInfo(project.id, branch.name);
            data.push([
                project.name,
                project.id,
                branchInfo.name,
                branchInfo.creator,
                branchInfo.create_time,
                branchInfo.lastModifierName,
                branchInfo.lastModifiedDate,
                '否'
            ]);
        }
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

    XLSX.writeFile(workbook, 'projects.xlsx');
}

generateExcel(502)
    .then(() => console.log('Excel file generated successfully.'))
    .catch((error) => console.error('Error:', error));
