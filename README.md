# gitlabBranches-batchesDelete
1.先安装依赖库，执行install node-fetch xlsx

2.修改getGitBranchs脚本中的accessToken为你自己的token，url也需要替换成你自己的gitlabHost

3.运行getGitBranchs脚本，可获取仓库分组下边的项目列表，列表包含['项目名称', '项目ID', '分支名称','分支创建人', '创建时间', '分支最后修改人', '分支最后修改时间','是否过期']字段

4.你需要将待删除分支的是否过期字段修改为“是"

5.将deleteBranch脚本中的accessToken和gitlabHost修改为你自己的配置

6.然后运行deleteBranch脚本，就会批量将gitlab的待删除分支进行删除
