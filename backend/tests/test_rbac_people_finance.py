import unittest

from rbac_cases import RBAC_MATRIX_PEOPLE_FINANCE
from rbac_test_support import assert_rbac_matrix


class PeopleFinanceRbacTest(unittest.TestCase):
    def test_people_finance_rbac_matrix(self):
        assert_rbac_matrix(self, RBAC_MATRIX_PEOPLE_FINANCE)
