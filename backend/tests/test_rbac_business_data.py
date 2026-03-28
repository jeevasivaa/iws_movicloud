import unittest

from rbac_cases import RBAC_MATRIX_BUSINESS_DATA
from rbac_test_support import assert_rbac_matrix


class BusinessDataRbacTest(unittest.TestCase):
    def test_business_data_rbac_matrix(self):
        assert_rbac_matrix(self, RBAC_MATRIX_BUSINESS_DATA)
