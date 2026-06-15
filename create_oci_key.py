import os

key = """-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBgoTNywOrzNY9WwDJtNxz1JFxBv1dO3mH0fXH7fbgaUwAAAJj5ZhJK+WYS
SgAAAAtzc2gtZWQyNTUxOQAAACBgoTNywOrzNY9WwDJtNxz1JFxBv1dO3mH0fXH7fbgaUw
AAAEDovGLV7mJmsnYmpPQM5TRRIfpO20Y0ZeQFPtB/ApE8S2ChM3LA6vM1j1bAMm03HPUk
XEG/V07eYfR9cft9uBpTAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
"""

path = os.path.expanduser(r"~\.ssh\oci_key")
os.makedirs(os.path.dirname(path), exist_ok=True)

with open(path, "w", newline="\n") as f:
    f.write(key.lstrip())

print(f"키 저장 완료: {path}")
